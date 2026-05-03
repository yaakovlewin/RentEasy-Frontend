/**
 * Tests for lenses - Functional Lens System
 *
 * Team B - Dev 6 (Testing & Performance)
 */

import { describe, it, expect } from '@jest/globals';
import {
  lens,
  prop,
  props,
  path,
  composeLens,
  compose,
  view,
  set,
  over,
  index,
  find,
  filter,
  traverse,
  withDefault,
  iso,
  type Lens,
} from '../lenses';

describe('lens', () => {
  it('should create a lens with get and set', () => {
    const nameLens = lens<{ name: string }, string>(
      (s) => s.name,
      (name) => (s) => ({ ...s, name })
    );

    const state = { name: 'John' };
    expect(view(nameLens, state)).toBe('John');

    const newState = set(nameLens, 'Jane', state);
    expect(newState.name).toBe('Jane');
    expect(state.name).toBe('John');
  });
});

describe('prop', () => {
  interface User {
    name: string;
    age: number;
  }

  it('should create property lens', () => {
    const nameLens = prop<User>()('name');
    const user = { name: 'John', age: 30 };

    expect(view(nameLens, user)).toBe('John');
  });

  it('should set property', () => {
    const nameLens = prop<User>()('name');
    const user = { name: 'John', age: 30 };
    const newUser = set(nameLens, 'Jane', user);

    expect(newUser.name).toBe('Jane');
    expect(newUser.age).toBe(30);
    expect(user.name).toBe('John');
  });
});

describe('props', () => {
  interface User {
    name: string;
    age: number;
    email: string;
  }

  it('should create multiple property lenses', () => {
    const { name, age, email } = props<User>()(['name', 'age', 'email']);
    const user = { name: 'John', age: 30, email: 'john@example.com' };

    expect(view(name, user)).toBe('John');
    expect(view(age, user)).toBe(30);
    expect(view(email, user)).toBe('john@example.com');
  });
});

describe('path', () => {
  it('should create path lens', () => {
    const cityLens = path<{ user: { address: { city: string } } }>()(['user', 'address', 'city']);
    const state = { user: { address: { city: 'NYC' } } };

    expect(view(cityLens, state)).toBe('NYC');
  });

  it('should set path value', () => {
    const cityLens = path<{ user: { address: { city: string } } }>()(['user', 'address', 'city']);
    const state = { user: { address: { city: 'NYC' } } };
    const newState = set(cityLens, 'LA', state);

    expect(newState.user.address.city).toBe('LA');
    expect(state.user.address.city).toBe('NYC');
  });
});

describe('composeLens', () => {
  interface Address {
    city: string;
    zip: string;
  }

  interface User {
    name: string;
    address: Address;
  }

  it('should compose lenses', () => {
    const addressLens = prop<User>()('address');
    const cityLens = prop<Address>()('city');
    const userCityLens = composeLens(addressLens, cityLens);

    const user = { name: 'John', address: { city: 'NYC', zip: '10001' } };
    expect(view(userCityLens, user)).toBe('NYC');
  });

  it('should set through composed lens', () => {
    const addressLens = prop<User>()('address');
    const cityLens = prop<Address>()('city');
    const userCityLens = composeLens(addressLens, cityLens);

    const user = { name: 'John', address: { city: 'NYC', zip: '10001' } };
    const newUser = set(userCityLens, 'LA', user);

    expect(newUser.address.city).toBe('LA');
    expect(user.address.city).toBe('NYC');
  });
});

describe('compose', () => {
  interface State {
    user: {
      address: {
        city: string;
      };
    };
  }

  it('should compose multiple lenses', () => {
    const composedLens = compose(
      prop<State>()('user'),
      prop<State['user']>()('address'),
      prop<State['user']['address']>()('city')
    );

    const state: State = { user: { address: { city: 'NYC' } } };
    expect(view(composedLens, state)).toBe('NYC');
  });
});

describe('view', () => {
  it('should view value through lens', () => {
    const nameLens = prop<{ name: string }>()('name');
    const state = { name: 'John' };

    expect(view(nameLens, state)).toBe('John');
  });
});

describe('set', () => {
  it('should set value through lens', () => {
    const nameLens = prop<{ name: string }>()('name');
    const state = { name: 'John' };
    const newState = set(nameLens, 'Jane', state);

    expect(newState.name).toBe('Jane');
    expect(state.name).toBe('John');
  });
});

describe('over', () => {
  it('should modify value through lens', () => {
    const ageLens = prop<{ age: number }>()('age');
    const user = { age: 30 };
    const olderUser = over(ageLens, (age) => age + 1, user);

    expect(olderUser.age).toBe(31);
    expect(user.age).toBe(30);
  });
});

describe('index', () => {
  it('should create array index lens', () => {
    const firstLens = index<number>(0);
    const arr = [1, 2, 3];

    expect(view(firstLens, arr)).toBe(1);
  });

  it('should set array element', () => {
    const firstLens = index<number>(0);
    const arr = [1, 2, 3];
    const newArr = set(firstLens, 5, arr);

    expect(newArr).toEqual([5, 2, 3]);
    expect(arr).toEqual([1, 2, 3]);
  });

  it('should return undefined for out of bounds', () => {
    const lens = index<number>(10);
    const arr = [1, 2, 3];

    expect(view(lens, arr)).toBeUndefined();
  });
});

describe('find', () => {
  interface User {
    id: number;
    name: string;
  }

  it('should find element in array', () => {
    const userLens = find<User>((u) => u.id === 2);
    const users = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 3, name: 'Bob' },
    ];

    expect(view(userLens, users)).toEqual({ id: 2, name: 'Jane' });
  });

  it('should update found element', () => {
    const userLens = find<User>((u) => u.id === 2);
    const users = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 3, name: 'Bob' },
    ];

    const newUsers = set(userLens, { id: 2, name: 'Janet' }, users);
    expect(newUsers[1]).toEqual({ id: 2, name: 'Janet' });
    expect(users[1]).toEqual({ id: 2, name: 'Jane' });
  });
});

describe('filter', () => {
  interface User {
    id: number;
    active: boolean;
  }

  it('should filter array elements', () => {
    const activeLens = filter<User>((u) => u.active);
    const users = [
      { id: 1, active: true },
      { id: 2, active: false },
      { id: 3, active: true },
    ];

    const activeUsers = view(activeLens, users);
    expect(activeUsers).toEqual([
      { id: 1, active: true },
      { id: 3, active: true },
    ]);
  });
});

describe('traverse', () => {
  interface User {
    name: string;
    age: number;
  }

  it('should map lens over array', () => {
    const nameLens = prop<User>()('name');
    const namesLens = traverse(nameLens);
    const users = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ];

    const names = view(namesLens, users);
    expect(names).toEqual(['John', 'Jane']);
  });

  it('should update all array elements', () => {
    const ageLens = prop<User>()('age');
    const agesLens = traverse(ageLens);
    const users = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ];

    const newUsers = set(agesLens, [31, 26], users);
    expect(newUsers[0].age).toBe(31);
    expect(newUsers[1].age).toBe(26);
  });
});

describe('withDefault', () => {
  it('should provide default value', () => {
    const optLens = prop<{ value?: string }>()('value');
    const safeLens = withDefault(optLens, 'default');

    const state1 = { value: 'test' };
    const state2 = {};

    expect(view(safeLens, state1)).toBe('test');
    expect(view(safeLens, state2 as any)).toBe('default');
  });
});

describe('iso', () => {
  it('should transform values bidirectionally', () => {
    const numberLens = prop<{ count: number }>()('count');
    const stringLens = iso(
      numberLens,
      (n) => n.toString(),
      (s) => parseInt(s, 10)
    );

    const state = { count: 42 };
    expect(view(stringLens, state)).toBe('42');

    const newState = set(stringLens, '100', state);
    expect(newState.count).toBe(100);
  });
});

describe('immutability', () => {
  it('should freeze lens results in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const nameLens = prop<{ name: string }>()('name');
    const state = { name: 'John' };
    const newState = set(nameLens, 'Jane', state);

    expect(Object.isFrozen(newState)).toBe(true);

    process.env.NODE_ENV = originalEnv;
  });

  it('should not freeze in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const nameLens = prop<{ name: string }>()('name');
    const state = { name: 'John' };
    const newState = set(nameLens, 'Jane', state);

    expect(Object.isFrozen(newState)).toBe(false);

    process.env.NODE_ENV = originalEnv;
  });
});
