module.exports = {
    name: "//h1",
    email: "//p[@itemprop='email']",
    website: "//li[contains(div, 'Site Web')]//a",
    phone: "//p[@itemprop='telephone']",
    employees: "//p[@itemprop='numberOfEmployees']",
    address: "//p[@itemprop='address']/text()",
    founders: "//div[@itemprop='founders']/p/text()",
    markets: "//h2[@class='txtArtTitre'][.='Marché :']/following-sibling::div[1]/p/text()",
    creationDate: "//meta[@itemprop='foundingDate']/following-sibling::p[1]",
};