const pdfKit = require('pdfkit')
const moment = require('moment')
const numeral = require('numeral')
const i18n = require('./i18n')

const TEXT_SIZE = 8
const CONTENT_LEFT_PADDING = 50

function PDFInvoice({
  company, // {phone, email, address}
  customer, // {name, email}
  items, // [{amount, name, description}]
}){
  const date = new Date()
  const charge = {
    createdAt: `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`,
    amount: items.reduce((acc, item) => acc + item.amount, 0),
  }
  const doc = new pdfKit({size: 'A4', margin: 50})

  doc.fillColor('#333333')

  const translate = i18n[PDFInvoice.lang]
  moment.locale(PDFInvoice.lang)

  const divMaxWidth = 550
  const table = {
    x: CONTENT_LEFT_PADDING,
    y: 200,
    inc: 150,
		currentY: 200
  }

  return {
    genHeader(){
      doc
       .fontSize(20)
       .text(company.name, CONTENT_LEFT_PADDING, 50)

      const borderOffset = doc.currentLineHeight() + 70

      doc
        .fontSize(16)
        .fillColor('#cccccc')
        .text(moment().format('MMMM, DD, YYYY'), CONTENT_LEFT_PADDING, 50, {
          align: 'right',
        })
        .fillColor('#333333')
    },

    genFooter(){
      doc.fillColor('#cccccc')

      doc
        .fontSize(12)
        .text(company.name, CONTENT_LEFT_PADDING, 450)

      doc.text(company.address)
      doc.text(company.phone)
      doc.text(company.email)

      doc.fillColor('#333333')
    },

    genCustomerInfos(){
      doc
        .fontSize(TEXT_SIZE)
        .text(translate.chargeFor, CONTENT_LEFT_PADDING, 400)

      doc.text(`${customer.name} <${customer.email}>`)
    },

    genTableHeaders(){
      [
        'name',
        'description',
        'quantity',
        'amount'
      ].forEach((text, i) => {
        doc
          .fontSize(TEXT_SIZE)
          .text(translate[text], table.x + i * table.inc, table.y)
      })
    },

    genTableRow(){
      items
        .map(item => Object.assign({}, item, {
          amount: numeral(item.amount).format('0,00.00')
        }))
        .forEach((item, itemIndex) => {
          [
            'name',
            'description',
            'quantity',
            'amount'
          ].forEach((field, i) => {
						table.currentY = table.y + TEXT_SIZE + 6 + itemIndex * 20
            doc
              .fontSize(TEXT_SIZE)
							.fillColor( '#000000' )
              .text(item[field], table.x + i * table.inc, table.currentY )
          })
        })
    },

    genTableFooter(){
			doc
				.fontSize(TEXT_SIZE)
				.fillColor( '#555555' )
				.text(translate['summary'], table.x + 0 * table.inc, table.currentY + items.length + TEXT_SIZE + 6 )

			const totalPrice = numeral(items.reduce( (a,b) => Number(a) + Number(b.amount || 0), 0)).format('0,00.00')
			doc
				.fontSize(TEXT_SIZE)
				.fillColor( '#555555' )
				.text(totalPrice + ' SEK', table.x + 3 * table.inc, table.currentY + items.length + TEXT_SIZE + 6 )
    },

    genTableLines(){
      const offset = doc.currentLineHeight() + 2
      doc
        .moveTo(table.x, table.currentY + offset)
        .lineTo(divMaxWidth, table.currentY + offset)
        .fillAndStroke( '#cccccc' )
    },

    generate(){
      this.genHeader()
      this.genTableHeaders()
      this.genTableLines()
      this.genTableRow()
      this.genTableLines()
			this.genTableFooter()
      this.genCustomerInfos()
      this.genFooter()

      doc.end()
    },

    get pdfkitDoc(){
      return doc
    },
  }
}

PDFInvoice.lang = 'sv_SE'
PDFInvoice.i18n = i18n

module.exports = PDFInvoice
