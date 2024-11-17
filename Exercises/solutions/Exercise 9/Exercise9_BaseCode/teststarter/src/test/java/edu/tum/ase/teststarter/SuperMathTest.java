package edu.tum.ase.teststarter;

import org.junit.Test;

import java.util.ArrayList;

import static org.junit.Assert.assertEquals;

public class SuperMathTest {

    @Test
    public void testFindFactors() {
        // given / arrange
        ArrayList<Integer> expectedResult = new ArrayList<Integer>();
        expectedResult.add(1);
        expectedResult.add(2);
        expectedResult.add(4);
        expectedResult.add(5);
        expectedResult.add(10);
        expectedResult.add(20);

        // when / act
        ArrayList<Integer> actualResult = SuperMath.findFactors(20);

        // then / assert
        assertEquals(expectedResult, actualResult);
    }
}
