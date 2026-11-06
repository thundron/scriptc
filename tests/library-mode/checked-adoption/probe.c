#include <stdint.h>
#include <stddef.h>
#include <stdio.h>
#include <string.h>

extern void n_init(void);
extern void n_collect(void);
extern double n_parse(const uint8_t *, size_t);
extern double n_sealed(const uint8_t *, size_t);
extern double n_extensible(const uint8_t *, size_t);

int main(void) {
    n_init();
    const char *text = "{\"x\":42}";
    for (int i = 0; i < 100; i++) {
        if (n_parse((const uint8_t *)text, strlen(text)) != 42) return 1;
        if (n_sealed((const uint8_t *)text, strlen(text)) != 0) return 2;
        if (n_extensible((const uint8_t *)text, strlen(text)) != 1) return 3;
        if (n_sealed((const uint8_t *)"[]", 2) != 0) return 4;
        if (n_extensible((const uint8_t *)"[]", 2) != 1) return 5;
        if (n_sealed((const uint8_t *)"null", 4) != 1) return 6;
        if (n_extensible((const uint8_t *)"null", 4) != 0) return 7;
    }
    n_collect();
    puts("100 native checked-cast library calls passed");
    return 0;
}
