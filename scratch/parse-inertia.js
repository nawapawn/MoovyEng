const fs = require('fs');

const b = fs.readFileSync('scratch/biscuit.html', 'utf8');
const m = b.match(/data-page="([^"]+)"/);
if (m) {
  const json = JSON.parse(m[1].replace(/&quot;/g, '"'));
  console.log('Props keys:', Object.keys(json.props));
  console.log('Product:', json.props.product?.name, 'Price:', json.props.product?.price);
  console.log('Variants:', json.props.product?.variants_and_quantity);
  console.log('Files:', json.props.product?.files);
  console.log('Previews:', json.props.product?.preview_url, json.props.product?.covers);
}
