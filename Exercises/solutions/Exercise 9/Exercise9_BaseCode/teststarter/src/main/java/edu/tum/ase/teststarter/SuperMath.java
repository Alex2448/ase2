package edu.tum.ase.teststarter;

import java.util.ArrayList;

public class SuperMath {

    /**
     * Returns an ArrayList of all the factors of an integer
     *
     * @param number to factor
     * @return ArrayList of factors
     */
    public static ArrayList<Integer> findFactors(long input) {
        ArrayList<Integer> factors = new ArrayList<Integer>();
        int i = 1;
        while (i <= input) {
            if (input % i == 0) {
                factors.add(i);
            }
            i++;
        }
        return factors;
    }

    /**
     * Full adder.
     * See: https://en.wikipedia.org/wiki/Adder_%28electronics%29#Full_adder
     *
     * @param a first input bit
     * @param b second input bit
     * @param c carry
     * @return Array that contains [result,carry]
     */
    public static Boolean[] fullAdder(Boolean a, Boolean b, Boolean c) {
        Boolean s, tmp;
        tmp = a != b;
        s = c != tmp;
        c = (a && b) || (tmp && c);
        return new Boolean[]{s, c};
    }

    /**
     * Adds binary numbers of arbitrary, but equal, size.
     * The numbers have to be represented as a boolean array.
     *
     * @param a first number
     * @param b second number
     * @return result array. It will be a.length + 1
     */
    public static Boolean[] BinaryAddition(Boolean[] a, Boolean[] b) throws ArrayLengthsMismatchException {
        if (a.length != b.length) {
            throw new SuperMath.ArrayLengthsMismatchException();
        }
        Boolean[] result = new Boolean[a.length + 1];
        Boolean carry = false;
        int i;
        for (i = 0; i < a.length; i++) {
            Boolean[] tmp = fullAdder(a[i], b[i], carry);
            result[i] = tmp[0];
            carry = tmp[1];
        }
        result[i] = carry;

        return result;
    }

    public static class ArrayLengthsMismatchException extends Exception {
    }

    /**
     * Represents a binary number as String. Will convert our internal right to left order
     * to the more natural left to right order
     *
     * @param in Number to display
     * @return Human readable String
     */
    public static String BinaryToString(Boolean[] in) {
        String res = "";
        for (int i = in.length - 1; i >= 0; i--) {
            if (in[i])
                res += "1";
            else
                res += "0";
        }
        return res;
    }

    /**
     * Returns a String representation of a binary addition
     *
     * @param a      first number
     * @param b      second number
     * @param result
     * @return Human readable String
     */
    public static String calculationString(Boolean[] a, Boolean[] b, Boolean[] result) {
        String res = " ";
        res += BinaryToString(a);
        res += "\n+";
        res += BinaryToString(b);
        res += "\n";
        for (int i = 0; i < a.length + 1; i++) {
            res += ("-");
        }
        res += "\n";
        res += BinaryToString(result);
        return res;
    }
}
