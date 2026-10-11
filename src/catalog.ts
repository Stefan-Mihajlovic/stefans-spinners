/** The shared catalog used by the React package and documentation. */
export const spinners = [
  { name: 'Orbit', id: 'orbit', category: 'Circular', count: 3, description: 'Three satellites finding their rhythm.' },
  { name: 'Arc', id: 'arc', category: 'Circular', count: 1, description: 'A quiet, continuous sweep.' },
  { name: 'Ring', id: 'ring', category: 'Circular', count: 1, description: 'The familiar circle, beautifully simple.' },
  { name: 'Dots', id: 'dots', category: 'Dots', count: 3, description: 'A little anticipation, three dots at a time.' },
  { name: 'Wave', id: 'wave', category: 'Bars', count: 5, description: 'Five bars moving in a flowing sequence.' },
  { name: 'Pulse', id: 'pulse', category: 'Dots', count: 1, description: 'A small heartbeat for your interface.' },
  { name: 'Ripple', id: 'ripple', category: 'Circular', count: 3, description: 'Soft circles spreading from the center.' },
  { name: 'Bars', id: 'bars', category: 'Bars', count: 4, description: 'A compact, confident equalizer.' },
  { name: 'Grid', id: 'grid', category: 'Geometric', count: 9, description: 'Nine squares, one playful pattern.' },
  { name: 'Breathe', id: 'breathe', category: 'Circular', count: 2, description: 'A gentle pause between moments.' },
  { name: 'Comet', id: 'comet', category: 'Circular', count: 1, description: 'A bright point with a fading trail.' },
  { name: 'Dual', id: 'dual', category: 'Circular', count: 2, description: 'Two arcs turning in opposite directions.' },
  { name: 'Flare', id: 'flare', category: 'Geometric', count: 8, description: 'A little sun with a rolling glow.' },
  { name: 'Flip', id: 'flip', category: 'Geometric', count: 1, description: 'A tile taking a turn in three dimensions.' },
  { name: 'Bloom', id: 'bloom', category: 'Geometric', count: 6, description: 'Six petals unfolding into motion.' },
  { name: 'Chase', id: 'chase', category: 'Dots', count: 8, description: 'A trail of dots that never stands still.' },
  { name: 'Bounce', id: 'bounce', category: 'Dots', count: 3, description: 'Three dots with a little extra energy.' },
  { name: 'Pendulum', id: 'pendulum', category: 'Dots', count: 3, description: 'A steady swing from side to side.' },
  { name: 'Square', id: 'square', category: 'Geometric', count: 2, description: 'Nested outlines on their own paths.' },
  { name: 'Stack', id: 'stack', category: 'Bars', count: 3, description: 'Layers sliding neatly into place.' },
  { name: 'Zigzag', id: 'zigzag', category: 'Bars', count: 5, description: 'A sharp little dance across five strokes.' },
  { name: 'Hourglass', id: 'hourglass', category: 'Geometric', count: 1, description: 'A modern nod to an old way of waiting.' },
  { name: 'Radar', id: 'radar', category: 'Circular', count: 2, description: 'A sweeping signal inside a fine circle.' },
  { name: 'Spark', id: 'spark', category: 'Geometric', count: 4, description: 'Four small diamonds, one bright idea.' },
] as const;
export type SpinnerName = typeof spinners[number]['name'];
export type SpinnerVariant = typeof spinners[number]['id'];
