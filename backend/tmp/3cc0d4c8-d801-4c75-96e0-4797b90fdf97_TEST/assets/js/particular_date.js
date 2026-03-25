const monthNames = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre'
]

function setDate(date = new Date()) {
  const text = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  document.write(text);
}