package es.stilnovo.library.util;

import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.text.NumberFormat;
import java.util.Locale;

/**
 * Centralized number formatting helpers for UI rendering.
 *
 * Locale convention used across the project:
 * - Thousands: '.'
 * - Decimal separator: ','
 */
public final class NumberFormattingUtils {

    private static final Locale ES_LOCALE = Locale.forLanguageTag("es-ES");
    private static final double EPSILON = 1e-9;

    private NumberFormattingUtils() {
        // Utility class
    }

    public static String formatQuantity(long value) {
        NumberFormat integerFormat = NumberFormat.getIntegerInstance(ES_LOCALE);
        return integerFormat.format(value);
    }

    public static String formatMoney(double value) {
        if (isWholeNumber(value)) {
            return formatQuantity(Math.round(value));
        }

        DecimalFormatSymbols symbols = new DecimalFormatSymbols(ES_LOCALE);
        symbols.setGroupingSeparator('.');
        symbols.setDecimalSeparator(',');

        DecimalFormat decimalFormat = new DecimalFormat("#,##0.00", symbols);
        return decimalFormat.format(value);
    }

    public static String formatPercentage(double value) {
        if (isWholeNumber(value)) {
            return formatQuantity(Math.round(value)) + "%";
        }

        DecimalFormatSymbols symbols = new DecimalFormatSymbols(ES_LOCALE);
        symbols.setGroupingSeparator('.');
        symbols.setDecimalSeparator(',');

        DecimalFormat decimalFormat = new DecimalFormat("#,##0.00", symbols);
        return decimalFormat.format(value) + "%";
    }

    private static boolean isWholeNumber(double value) {
        return Math.abs(value - Math.rint(value)) < EPSILON;
    }
}