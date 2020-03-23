'use strict';

var pdfKit = require('pdfkit');
var moment = require('moment');
var numeral = require('numeral');
var i18n = require('./i18n');

var TEXT_SIZE = 8;
var CONTENT_LEFT_PADDING = 50;

function PDFInvoice(_ref) {
  var company = _ref.company,
      customer = _ref.customer,
      items = _ref.items;

  var date = new Date();
  var charge = {
    createdAt: date.getDay() + '/' + date.getMonth() + '/' + date.getFullYear(),
    amount: items.reduce(function (acc, item) {
      return acc + item.amount;
    }, 0)
  };
  var doc = new pdfKit({ size: 'A4', margin: 50 });

  doc.fillColor('#333333');

  var translate = i18n[PDFInvoice.lang];
  moment.locale(PDFInvoice.lang);

  var divMaxWidth = 550;
  var table = {
    x: CONTENT_LEFT_PADDING,
    y: 200,
    inc: 150,
    currentY: 200
  };

  return {
    genHeader: function genHeader() {
      doc.fontSize(20).text(company.name, CONTENT_LEFT_PADDING, 50);

      var borderOffset = doc.currentLineHeight() + 70;

      doc.fontSize(16).fillColor('#cccccc').text(moment().format('MMMM, DD, YYYY'), CONTENT_LEFT_PADDING, 50, {
        align: 'right'
      }).fillColor('#333333');
    },
    genFooter: function genFooter() {
      doc.fillColor('#cccccc');

      doc.fontSize(12).text(company.name, CONTENT_LEFT_PADDING, 450);

      doc.text(company.address);
      doc.text(company.phone);
      doc.text(company.email);

      doc.fillColor('#333333');
    },
    genCustomerInfos: function genCustomerInfos() {
      doc.fontSize(TEXT_SIZE).text(translate.chargeFor, CONTENT_LEFT_PADDING, 400);

      doc.text(customer.name + ' <' + customer.email + '>');
      doc.text('' + customer.address);
      doc.text('' + customer.phone);
    },
    genTableHeaders: function genTableHeaders() {
      ['name', 'description', 'amount', 'price'].forEach(function (text, i) {
        doc.fontSize(TEXT_SIZE).text(translate[text], table.x + i * table.inc, table.y);
      });
    },
    genTableRow: function genTableRow() {
      items.map(function (item) {
        return Object.assign({}, item, {
          price: numeral(item.price).format('0,00.00')
        });
      }).forEach(function (item, itemIndex) {
        ['name', 'description', 'amount', 'price'].forEach(function (field, i) {
          table.currentY = table.y + TEXT_SIZE + 6 + itemIndex * 20;
          doc.fontSize(TEXT_SIZE).fillColor('#000000').text(item[field], table.x + i * table.inc, table.currentY);
        });
      });
    },
    genTableFooter: function genTableFooter() {
      doc.fontSize(TEXT_SIZE).fillColor('#555555').text(translate['summary'], table.x + 0 * table.inc, table.currentY + items.length + TEXT_SIZE + 6);

      var totalPrice = numeral(items.reduce(function (a, b) {
        return Number(a) + Number(b.price || 0);
      }, 0)).format('0,00.00');
      doc.fontSize(TEXT_SIZE).fillColor('#555555').text(totalPrice + ' SEK', table.x + 3 * table.inc, table.currentY + items.length + TEXT_SIZE + 6);
    },
    genTableLines: function genTableLines() {
      var offset = doc.currentLineHeight() + 2;
      doc.moveTo(table.x, table.currentY + offset).lineTo(divMaxWidth, table.currentY + offset).fillAndStroke('#cccccc');
    },
    generate: function generate() {
      this.genHeader();
      this.genTableHeaders();
      this.genTableLines();
      this.genTableRow();
      this.genTableLines();
      this.genTableFooter();
      this.genCustomerInfos();
      this.genFooter();

      doc.end();
    },


    get pdfkitDoc() {
      return doc;
    }
  };
}

PDFInvoice.lang = 'sv_SE';
PDFInvoice.i18n = i18n;

module.exports = PDFInvoice;