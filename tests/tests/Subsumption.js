suite('Subsumption', function() {
  test('Add states', function() {
    var machine = new statejs.Subsumption();

    var state_a = StateStub();
    var state_b = StateStub();
    machine.add('a', state_a);
    machine.add('b', state_b);

    assert.equal(state_a.machine, machine);
    assert.equal(state_b.machine, machine);
  });

  test('Add states (Error)', function() {
    var machine = new statejs.Subsumption();

    var state_a = StateStub();
    var state_b = StateStub();
    machine.add('a', state_a);
    
    assert.throw(function() {machine.add('a', state_b)}, Error);
  });

  test('List states', function() {
    var machine = new statejs.Subsumption();

    var state_a = StateStub();
    var state_b = StateStub();
    machine.add('a', state_a);
    machine.add('b', state_b);

    var states = machine.list();
    assert.equal(states.length, 2);
    assert.notEqual(states.indexOf('a'), -1);
    assert.notEqual(states.indexOf('b'), -1);
  });

  test('Get states', function() {
    var machine = new statejs.Subsumption();

    var state_a = StateStub();
    var state_b = StateStub();
    machine.add('a', state_a);
    machine.add('b', state_b);

    assert.equal(machine.get('a'), state_a);
    assert.equal(machine.get('b'), state_b);
  });

  test('Checking potential state', function() {
    var machine = new statejs.Subsumption();
    machine.id = '1';

    var state_a = StateStub();
    var state_b = StateStub();
    machine.add('a', state_a);
    machine.add('b', state_b);

    var target = null;
    var memory = BlackboardStub();

    // ticking
    machine.tick(target, memory);
    assert.isTrue(state_a.potential.withArgs(target, memory).calledOnce);
    assert.isTrue(state_b.potential.withArgs(target, memory).calledOnce);
  });
  
  test('Current state name', function() {
    var machine = new statejs.Subsumption();
    machine.id = '1';

    var memory = BlackboardStub();

    assert.notEqual(machine.name(memory), 'a');
    memory.get.withArgs('name', '1').returns('a');
    assert.equal(machine.name(memory), 'a');
  });

  test('State transition', function() {
    var machine = new statejs.Subsumption();
    machine.id = '1';

    var state_a = StateStub();
    var state_b = StateStub();
    machine.add('a', state_a);
    machine.add('b', state_b);

    var target = null;
    var memory = BlackboardStub();

    // ticking
    state_a.potential.returns(true);
    machine.tick(target, memory);
    assert.isTrue(memory.set.withArgs('name', 'a', '1').calledOnce);
    assert.isTrue(state_a.potential.withArgs(target, memory).calledOnce);
    assert.isTrue(state_a.enter.withArgs(target, memory).calledOnce);

    assert.isFalse(state_b.potential.withArgs(target, memory).calledOnce);
    assert.isFalse(state_b.enter.withArgs(target, memory).calledOnce);
  });

  test('State transition (cont)', function() {
    var machine = new statejs.Subsumption();
    machine.id = '1';

    var state_a = StateStub();
    var state_b = StateStub();
    machine.add('a', state_a);
    machine.add('b', state_b);

    var target = null;
    var memory = BlackboardStub();
    // ticking
    state_a.potential.returns(false);
    state_b.potential.returns(true);
    machine.tick(target, memory);
    assert.isTrue(memory.set.withArgs('name', 'b', '1').calledOnce);
    assert.isTrue(state_a.potential.withArgs(target, memory).calledOnce);
    assert.isFalse(state_a.enter.withArgs(target, memory).calledOnce);

    assert.isTrue(state_b.potential.withArgs(target, memory).calledOnce);
    assert.isTrue(state_b.enter.withArgs(target, memory).calledOnce);
  });

  test('Transition to null', function() {
    var machine = new statejs.Subsumption();
    machine.id = '1';

    var state_a = StateStub();
    var state_b = StateStub();
    machine.add('a', state_a);
    machine.add('b', state_b);

    var target = null;
    var memory = BlackboardStub();
    // ticking
    state_a.potential.returns(false);
    state_b.potential.returns(false);
    machine.tick(target, memory);

    assert.isTrue(memory.set.withArgs('name', null, '1').calledOnce);
    assert.isFalse(state_a.enter.withArgs(target, memory).calledOnce);
    assert.isFalse(state_b.enter.withArgs(target, memory).calledOnce);
  });



  test('Ticking current state', function() {
    var machine = new statejs.Subsumption();
    machine.id = '1';

    var state_a = StateStub();
    var state_b = StateStub();
    machine.add('a', state_a);
    machine.add('b', state_b);

    var target = null;
    var memory = BlackboardStub();
    // ticking
    state_a.potential.returns(false);
    state_b.potential.returns(true);
    machine.tick(target, memory);

    assert.isFalse(state_a.tick.withArgs(target, memory).calledOnce);
    assert.isTrue(state_b.tick.withArgs(target, memory).calledOnce);
  });
});