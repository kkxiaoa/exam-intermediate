const hello = require('../hello.js')

test('should get hello world', () => {
  expect(hello()).toBe('hello world')
})