def binary_code(n):
    if n > 1:
        binary_code(n // 2)
    print(n % 2, end='')

# Example usage:
n = 10
binary_code(n)