// Compiler dispatchers often use long left-associated chains. Keep every
// operand observable so compilation must preserve order and short-circuiting.
function dispatch(winner: number): number {
  const calls: number[] = [];
  function candidate(index: number): number | null | undefined {
    calls.push(index);
    return index === winner ? 0 : index % 2 === 0 ? null : undefined;
  }
  const result =
    candidate(0) ?? candidate(1) ?? candidate(2) ?? candidate(3) ??
    candidate(4) ?? candidate(5) ?? candidate(6) ?? candidate(7) ??
    candidate(8) ?? candidate(9) ?? candidate(10) ?? candidate(11) ??
    candidate(12) ?? candidate(13) ?? candidate(14) ?? candidate(15) ??
    candidate(16) ?? candidate(17) ?? candidate(18) ?? candidate(19) ??
    candidate(20) ?? candidate(21) ?? candidate(22) ?? candidate(23) ??
    candidate(24) ?? candidate(25) ?? candidate(26) ?? candidate(27) ??
    candidate(28) ?? candidate(29) ?? candidate(30) ?? candidate(31) ??
    candidate(32) ?? candidate(33) ?? candidate(34) ?? candidate(35) ??
    candidate(36) ?? candidate(37) ?? candidate(38) ?? candidate(39) ??
    candidate(40) ?? candidate(41) ?? candidate(42) ?? candidate(43) ??
    candidate(44) ?? candidate(45) ?? candidate(46) ?? candidate(47) ??
    candidate(48) ?? candidate(49) ?? candidate(50) ?? candidate(51) ??
    candidate(52) ?? candidate(53) ?? candidate(54) ?? candidate(55) ??
    candidate(56) ?? candidate(57) ?? candidate(58) ?? candidate(59) ??
    candidate(60) ?? candidate(61) ?? candidate(62) ?? candidate(63) ??
    candidate(64) ?? candidate(65) ?? candidate(66) ?? candidate(67) ??
    candidate(68) ?? candidate(69) ?? candidate(70) ?? candidate(71) ??
    candidate(72) ?? candidate(73) ?? candidate(74) ?? candidate(75) ??
    candidate(76) ?? candidate(77) ?? candidate(78) ?? candidate(79) ??
    candidate(80) ?? candidate(81) ?? candidate(82) ?? candidate(83) ??
    candidate(84) ?? candidate(85) ?? candidate(86) ?? candidate(87) ??
    candidate(88) ?? candidate(89) ?? candidate(90) ?? candidate(91) ??
    candidate(92) ?? candidate(93) ?? candidate(94) ?? candidate(95) ?? -1;
  console.log(winner, result, calls.join(","));
  return result;
}
dispatch(0);
dispatch(47);
dispatch(95);
dispatch(96);

let sequence = "";
function text(label: string, value: string | null | undefined): string | null | undefined {
  sequence += label;
  return value;
}
console.log(text("a", null) ?? (text("b", undefined) ?? text("c", "")) ?? text("d", "unused"));
console.log(sequence);
sequence = "";
console.log((text("a", undefined) ?? text("b", null)) ?? text("c", "end") ?? text("d", "unused"));
console.log(sequence);

// Logical chains also occur in compiler predicates and retain operand values.
function logicalDispatch(winner: number): void {
  const calls: number[] = [];
  function probe(index: number): number {
    calls.push(index);
    return index === winner ? index + 1 : 0;
  }
  const found =
    probe(0) || probe(1) || probe(2) || probe(3) ||
    probe(4) || probe(5) || probe(6) || probe(7) ||
    probe(8) || probe(9) || probe(10) || probe(11) ||
    probe(12) || probe(13) || probe(14) || probe(15) ||
    probe(16) || probe(17) || probe(18) || probe(19) ||
    probe(20) || probe(21) || probe(22) || probe(23) ||
    probe(24) || probe(25) || probe(26) || probe(27) ||
    probe(28) || probe(29) || probe(30) || probe(31) ||
    probe(32) || probe(33) || probe(34) || probe(35) ||
    probe(36) || probe(37) || probe(38) || probe(39) ||
    probe(40) || probe(41) || probe(42) || probe(43) ||
    probe(44) || probe(45) || probe(46) || probe(47) ||
    probe(48) || probe(49) || probe(50) || probe(51) ||
    probe(52) || probe(53) || probe(54) || probe(55) ||
    probe(56) || probe(57) || probe(58) || probe(59) ||
    probe(60) || probe(61) || probe(62) || probe(63);
  console.log("or", winner, found, calls.join(","));
  calls.length = 0;
  function accept(index: number): number {
    calls.push(index);
    return index === winner ? 0 : index + 1;
  }
  const accepted =
    accept(0) && accept(1) && accept(2) && accept(3) &&
    accept(4) && accept(5) && accept(6) && accept(7) &&
    accept(8) && accept(9) && accept(10) && accept(11) &&
    accept(12) && accept(13) && accept(14) && accept(15) &&
    accept(16) && accept(17) && accept(18) && accept(19) &&
    accept(20) && accept(21) && accept(22) && accept(23) &&
    accept(24) && accept(25) && accept(26) && accept(27) &&
    accept(28) && accept(29) && accept(30) && accept(31) &&
    accept(32) && accept(33) && accept(34) && accept(35) &&
    accept(36) && accept(37) && accept(38) && accept(39) &&
    accept(40) && accept(41) && accept(42) && accept(43) &&
    accept(44) && accept(45) && accept(46) && accept(47) &&
    accept(48) && accept(49) && accept(50) && accept(51) &&
    accept(52) && accept(53) && accept(54) && accept(55) &&
    accept(56) && accept(57) && accept(58) && accept(59) &&
    accept(60) && accept(61) && accept(62) && accept(63);
  console.log("and", winner, accepted, calls.join(","));
}
logicalDispatch(0);
logicalDispatch(31);
logicalDispatch(63);
logicalDispatch(64);
