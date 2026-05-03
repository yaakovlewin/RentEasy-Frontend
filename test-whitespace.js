const { render, screen } = require('@testing-library/react');
const React = require('react');

const TestComponent = ({ text }) => {
  return <div role="alert" style={{ whiteSpace: 'pre-wrap' }}><span style={{ whiteSpace: 'pre-wrap' }}>{text}</span></div>;
};

const longMessage = 'hello '.repeat(3);
render(React.createElement(TestComponent, { text: longMessage }));
const alert = screen.getByRole('alert');
console.log('textContent:', JSON.stringify(alert.textContent));
console.log('innerHTML:', alert.innerHTML);
console.log('Looking for:', JSON.stringify(longMessage));
