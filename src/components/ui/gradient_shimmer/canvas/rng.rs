const U32_MAX_F64: f64 = u32::MAX as f64;

pub(super) struct PseudoRng {
    state: u32,
}

impl PseudoRng {
    pub(super) fn new(seed: u32) -> Self {
        Self {
            state: if seed == 0 { 0x9e37_79b9 } else { seed },
        }
    }

    pub(super) fn next_f64(&mut self) -> f64 {
        self.state ^= self.state << 13;
        self.state ^= self.state >> 17;
        self.state ^= self.state << 5;

        self.state as f64 / U32_MAX_F64
    }
}
