#include <stdint.h>
#include <stdio.h>
extern void fus_init(void);
extern void fus_collect(void);
extern double fus_run(double);
extern double fus_product(double, double);
static double hash(const char *text) {
    uint32_t value = 0;
    for (; *text; text++) value = value * UINT32_C(33) + (unsigned char)*text;
    return value > INT32_MAX ? (double)((int64_t)value - INT64_C(4294967296)) : (double)value;
}
int main(void) {
    fus_init();
    for (int i = 0; i < 100; i++) {
        if (fus_run(3) != hash("{\"name\":\"x\",\"sofa\":{\"seats\":2,\"depth\":3},\"bed\":{\"width\":160}}")) return 1;
        if (fus_product(1, 1) != hash("{\"before\":1,\"x\":\"late\",\"between\":2,\"after\":3}")) return 2;
        if (fus_product(0, 0) != hash("{\"before\":1,\"y\":\"r\",\"between\":2,\"z\":false,\"after\":3}")) return 3;
    }
    fus_collect();
    puts("100 native union-spread calls passed");
    return 0;
}
