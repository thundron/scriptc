class Queue {
  head = { value: 0, next: null };
  tail = this.head;
  append(value) {
    this.tail.next = { value, next: null };
    this.tail = this.tail.next;
  }
  values() {
    const result = [];
    let current = this.head.next;
    while (current !== null) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
}
const queue = new Queue();
queue.append(20);
queue.append(22);
console.log(queue.values().join(","));
