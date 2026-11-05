#include <stdint.h>
#include <stddef.h>
#include <stdio.h>
#include <string.h>

extern void n_init(void);
extern void n_collect(void);
extern double n_parse(const uint8_t *, size_t);

int main(void) {
    n_init();
    const char *text = "{\"x\":42}";
    for (int i = 0; i < 100; i++) {
        if (n_parse((const uint8_t *)text, strlen(text)) != 42) return 1;
    }
    n_collect();
    puts("100 native checked-cast library calls passed");
    return 0;
}
