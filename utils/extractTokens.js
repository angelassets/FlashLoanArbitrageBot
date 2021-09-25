let jsonData = require('./token-list.json');

let tokens = Object.keys(jsonData.tokens).map((key) => [
  jsonData.tokens[key].symbol,
  jsonData.tokens[key].address,
]);

//tokens = tokens.reduce((a, v) => ({ ...a, [v[0]]: v[1] }), {});

let output;

for (let i = 0; i < tokens.length; i++) {
  output += '"' + tokens[i][0] + '": ' + '"' + tokens[i][1] + '",';
}

console.log(output);
