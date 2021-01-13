expect.extend({
  toMatchPositionOrder: (nodes, positions) => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].lon !== positions[i][0] || nodes[i].lat !== positions[i][1]) {
        return {
          message: () => `expected node at index ${i} to match`,
          pass: false,
        };
      }
      return { pass: true, message: () => `expected nodes to not match positions` };
    }
  },
  toHaveChangeActionLengths: (change, createLength, modifyLength, deleteLength) => {
    if (change.create.length !== createLength) {
      return {
        message: () => `expected create length to be ${createLength}, received: ${change.create.length}`,
        pass: false
      };
    }
    if (change.modify.length !== modifyLength) {
      return {
        message: () => `expected modify length to be ${modifyLength}, received: ${change.modify.length}`,
        pass: false
      };
    }
    if (change.delete.length !== deleteLength) {
      return {
        message: () => `expected delete length to be ${deleteLength}, received: ${change.delete.length}`,
        pass: false
      };
    }
    return {pass: true}
  },
});
