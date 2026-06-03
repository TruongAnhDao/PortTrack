package com.musketeers.porttrack.service.impl;

import com.musketeers.porttrack.dto.response.StockPriceResponse;
import com.musketeers.porttrack.service.StockPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class StockPriceServiceImpl implements StockPriceService {

    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final BigDecimal PRICE_MULTIPLIER = new BigDecimal("1000");
    private static final Duration QUOTE_CACHE_TTL = Duration.ofSeconds(30);

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final Map<String, CachedQuote> quoteCache = new ConcurrentHashMap<>();

    @Override
    public BigDecimal getCurrentPrice(String symbol) {
        return getLatestQuote(symbol).getPrice();
    }

    @Override
    public StockPriceResponse getLatestQuote(String symbol) {
        String normalizedSymbol = normalizeSymbol(symbol);
        Instant now = Instant.now();
        CachedQuote cachedQuote = quoteCache.get(normalizedSymbol);

        if (cachedQuote != null && cachedQuote.expiresAt().isAfter(now)) {
            return cachedQuote.quote();
        }

        StockPriceResponse latestQuote = fetchLatestQuote(normalizedSymbol, now);
        quoteCache.put(normalizedSymbol, new CachedQuote(latestQuote, now.plus(QUOTE_CACHE_TTL)));
        return latestQuote;
    }

    private StockPriceResponse fetchLatestQuote(String normalizedSymbol, Instant now) {
        try {
            long toDate = now.getEpochSecond();
            long fromDate = toDate - (3L * 24 * 60 * 60);
            String encodedSymbol = URLEncoder.encode(normalizedSymbol, StandardCharsets.UTF_8);
            String url = "https://services.entrade.com.vn/chart-api/v2/ohlcs/stock"
                    + "?from=" + fromDate
                    + "&to=" + toDate
                    + "&symbol=" + encodedSymbol
                    + "&resolution=1";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new RuntimeException("Cannot fetch stock price. HTTP status: " + response.statusCode());
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode timestamps = root.get("t");
            JsonNode closePrices = root.get("c");

            if (timestamps == null || closePrices == null || !timestamps.isArray() || !closePrices.isArray()
                    || timestamps.size() == 0 || closePrices.size() == 0) {
                throw new RuntimeException("No price data found for symbol " + normalizedSymbol);
            }

            int lastIndex = timestamps.size() - 1;
            BigDecimal closePrice = closePrices.get(lastIndex).decimalValue().multiply(PRICE_MULTIPLIER);
            BigDecimal openPrice = readScaledDecimal(root.get("o"), lastIndex);
            Long volume = readLong(root.get("v"), lastIndex);
            LocalDate tradeDate = Instant.ofEpochSecond(timestamps.get(lastIndex).asLong())
                    .atZone(VIETNAM_ZONE)
                    .toLocalDate();

            return StockPriceResponse.builder()
                    .symbol(normalizedSymbol)
                    .price(closePrice)
                    .openPrice(openPrice)
                    .volume(volume)
                    .tradeDate(tradeDate)
                    .marketOpen(isVietnamMarketOpen())
                    .build();
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch price data: " + e.getMessage(), e);
        }
    }

    private record CachedQuote(StockPriceResponse quote, Instant expiresAt) {
    }

    private String normalizeSymbol(String symbol) {
        if (symbol == null || symbol.isBlank()) {
            throw new RuntimeException("Stock symbol is required.");
        }
        return symbol.trim().toUpperCase();
    }

    private BigDecimal readScaledDecimal(JsonNode node, int index) {
        if (node == null || !node.isArray() || node.size() <= index || node.get(index).isNull()) {
            return null;
        }
        return node.get(index).decimalValue().multiply(PRICE_MULTIPLIER);
    }

    private Long readLong(JsonNode node, int index) {
        if (node == null || !node.isArray() || node.size() <= index || node.get(index).isNull()) {
            return null;
        }
        return node.get(index).asLong();
    }

    private boolean isVietnamMarketOpen() {
        DayOfWeek day = LocalDate.now(VIETNAM_ZONE).getDayOfWeek();
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            return false;
        }

        LocalTime now = LocalTime.now(VIETNAM_ZONE);
        boolean morningSession = !now.isBefore(LocalTime.of(9, 0)) && now.isBefore(LocalTime.of(11, 30));
        boolean afternoonSession = !now.isBefore(LocalTime.of(13, 0)) && now.isBefore(LocalTime.of(15, 0));
        return morningSession || afternoonSession;
    }
}
