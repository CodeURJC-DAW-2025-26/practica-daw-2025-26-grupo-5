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

    /**
     * Formats an integer quantity using locale-specific thousands separator.
     * @param value the number to format
     * @return formatted quantity string (e.g., "1.000" in ES locale)
     */
    public static String formatQuantity(long value) {
        NumberFormat integerFormat = NumberFormat.getIntegerInstance(ES_LOCALE);
        return integerFormat.format(value);
    }

    /**
     * Formats a monetary value with proper decimal separator and precision.
     * @param value the amount to format
     * @return formatted money string (e.g., "150,50" in ES locale)
     */
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

    /**
     * Formats a percentage value with proper decimal separator and % symbol.
     * @param value the percentage to format
     * @return formatted percentage string (e.g., "85,50%" in ES locale)
     */
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

    /**
     * Checks if a double value is effectively an integer within epsilon tolerance.
     * @param value the number to check
     * @return true if the value is a whole number
     */
    private static boolean isWholeNumber(double value) {
        return Math.abs(value - Math.rint(value)) < EPSILON;
    }
}