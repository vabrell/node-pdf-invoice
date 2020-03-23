const fs = require('fs')
const path = require('path')
const generator = require('../dist/index')

const document = generator({
  company: {
    phone: '+46-70-10 20 300',
    email: 'info@foretag.se',
    address: 'Affärsvägen 123, Göteborg',
    name: 'Företag AB',
  },
  customer: {
    name: 'Sven Svensson',
    email: 'sven.svensson@gmail.com',
  },
  items: [
    {amount: 50.0, name: 'XYZ', description: 'Lorem ipsum dollor sit amet', quantity: 12},
    {amount: 12.0, name: 'ABC', description: 'Lorem ipsum dollor sit amet', quantity: 12},
    {amount: 127.72, name: 'DFE', description: 'Lorem ipsum dollor sit amet', quantity: 12},
  ],
})

document.generate()

document
  .pdfkitDoc
  .pipe(
    fs.createWriteStream(
      path.join(process.cwd(), 'tests/testing.pdf')
    )
  )
