import counterReducer, { increment, decrement, reset } from '../src/redux/counterSlice';

describe('counterSlice', () => {
  const initialState = { value: 0 };

  it('should return the initial state', () => {
    expect(counterReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle increment', () => {
    const actual = counterReducer(initialState, increment());
    expect(actual.value).toEqual(1);
  });

  it('should handle decrement', () => {
    const actual = counterReducer(initialState, decrement());
    expect(actual.value).toEqual(-1);
  });

  it('should handle reset', () => {
    const state = { value: 42 };
    const actual = counterReducer(state, reset());
    expect(actual.value).toEqual(0);
  });

  it('should handle multiple increments', () => {
    let state = initialState;
    state = counterReducer(state, increment());
    state = counterReducer(state, increment());
    state = counterReducer(state, increment());
    expect(state.value).toEqual(3);
  });
});
