import add from "../first";


it(
    'first test', () => {
        const result = add();
        expect(result.name).toBe("add");
    }
)