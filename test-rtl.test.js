const { render, screen } = require('@testing-library/react');
const React = require('react');

test('RTL long text matching', () => {
  const longMessage = 'This is a very long error message that contains a lot of text and should still be displayed properly without breaking the layout or causing any visual issues in the component rendering. '.repeat(3);
  
  render(React.createElement('div', { role: 'alert' }, longMessage));
  
  const alert = screen.getByRole('alert');
  console.log('textContent length:', alert.textContent.length);
  console.log('longMessage length:', longMessage.length);
  console.log('Are they equal?', alert.textContent === longMessage);
  console.log('After trim equal?', alert.textContent.trim() === longMessage.trim());
  
  expect(screen.getByText(longMessage)).toBeInTheDocument();
});
