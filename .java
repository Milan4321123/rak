public class ConditionalTest {

    static void checkValue(int x) {
        if (x < 0) {
            System.out.println("Negative");
        } else if (x == 0) {
            System.out.println("Zero");
        } else {
            System.out.println("Positive");
        }
        // Trigger an assertion failure to capture the state.
        assert(false);
    }

    public static void main(String[] args) {
        checkValue(42);
    }
}