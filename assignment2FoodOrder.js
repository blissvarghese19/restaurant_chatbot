const { SinkContext } = require("twilio/lib/rest/events/v1/sink");
const { validateExpressRequest } = require("twilio/lib/webhooks/webhooks");
const Order = require("./assignment2Order");
//variable declaration
const smallShawarmaPrice = 5;
const regularShawarmaPrice = 9;
const largeShawarmaPrice = 15;
const smallBurritoPrice = 4;
const regularBurritoPrice = 6;
const largeBurritoPrice = 8;
const smallHamBurgerPrice = 2.50;
const regularHamBurgerPrice = 4;
const largeHamBurgerPrice = 6;
const fillingCost = 2;
const sauceCost = 1;
const drinksCost = 2;
const tax = 0.13;
var shippingAddress = "";
//object created
const OrderState = Object.freeze({
  WELCOMING: Symbol("welcoming"),
  ITEM: Symbol("items"),
  SIZE: Symbol("size"),
  SAUCES: Symbol("sauces"),
  FILLINGS: Symbol("fillings"),
  DRINKS: Symbol("drinks"),
  MORE: Symbol("more"),
  INVOICE: Symbol("invoice"),
  PAYMENT: Symbol("payment")
});
module.exports = class ShawarmaOrder extends Order {
  constructor(sNumber, sUrl) {
    super(sNumber, sUrl);
    this.stateCur = OrderState.WELCOMING;
    this.sItem = "";
    this.sSize = "";
    this.sSauces = "";
    this.sFillings = "";
    this.sDrinks = "";
    this.sMore = "";
    this.sInvoice = "";
    this.sMessage = "";
    this.sSubTotal = 0;
    this.sTax = 0;
    this.sTotalCost = 0;
    this.sBool = "true";
  }
  handleInput(sInput) {
    //array created
    let aReturn = [];
    switch (this.stateCur) {
      case OrderState.WELCOMING:
        this.stateCur = OrderState.SIZE;
        //welcome message
        if (this.sBool == "true") {
          aReturn.push("Welcome to BKV Fast Food Cafeteria.");
          this.sBool = "false";
        }
        //menu list
        aReturn.push("Our Menu \n 1.Shawarma \n 2.Burrito \n 3.Hamburger.");
        aReturn.push("What  would you like to order ?");
        break;
      case OrderState.SIZE:
        if(sInput.toLowerCase() == "shawarma" || sInput.toLowerCase() == "burrito" || sInput.toLowerCase() == "hamburger")
        {
        this.sItem = sInput;
        //checking which item ordered
        if (this.sItem.toLowerCase() == "shawarma") {
          this.stateCur = OrderState.FILLINGS;
        }
        else if (this.sItem.toLowerCase() == "burrito") {
          this.stateCur = OrderState.FILLINGS;
        }
        else if (this.sItem.toLowerCase() == "hamburger") {
          this.stateCur = OrderState.SAUCES;
        }
        aReturn.push("what size would you like to order?");
        aReturn.push("small / regular / large");
        }
        else{
          aReturn.push("please enter SHAWARMA or BURRITO or HAMBURGER");
          this.stateCur = OrderState.SIZE;
        }
        break;
      case OrderState.FILLINGS:
        //error handling if the size properly entered or not
        //below code executes if properly done
        if (sInput.toLowerCase() == "small" || sInput.toLowerCase() == "regular"
          || sInput.toLowerCase() == "large") {
          this.sSize = sInput;
          this.stateCur = OrderState.DRINKS;
          this.sSubTotal += fillingCost;
          aReturn.push("what fillings would you like to have?");
        }
        //this part works if size not properly entered
        else {
          aReturn.push("Please enter SMALL or REGULAR or LARGE");
          this.stateCur = OrderState.FILLINGS;
        }
        break;
      case OrderState.SAUCES:
        //error handling if the size properly entered or not
        //below code executes if properly done
        if (sInput.toLowerCase() == "small" || sInput.toLowerCase() == "regular"
          || sInput.toLowerCase() == "large") {
          this.sSize = sInput;
          this.stateCur = OrderState.DRINKS;
          this.sSubTotal += sauceCost;
          aReturn.push("what sauces would you like to have?");
        }
        //this part works if size not properly entered
        else {
          aReturn.push("Please enter SMALL or REGULAR or LARGE");
          this.stateCur = OrderState.FILLINGS;
        }
        break;
      case OrderState.DRINKS:
        this.sFillings = sInput;
        this.stateCur = OrderState.MORE;
        aReturn.push("if you like to order drinks enter yes or enter no if you dont want");
        break;
      case OrderState.MORE:
        this.stateCur = OrderState.INVOICE;
        this.sDrinks = sInput;
        //output message of ordered items.
        this.sMessage += `${this.sSize} ${this.sFillings} ${this.sItem} `;
        if (this.sDrinks.toLowerCase() != "no") {
          //with drinks execute here
          this.sMessage += ` with ${this.sDrinks}\n\n`;
          this.sSubTotal += drinksCost;
        }
        else {
          //without drinks execute here
          this.sMessage += "\n\n";
        }
        if (this.sItem.toLowerCase() == "shawarma") {
          if (this.sSize == "small") {
            this.sSubTotal += smallShawarmaPrice;
          }
          else if (this.sSize == "regular") {
            this.sSubTotal += regularShawarmaPrice;
          }
          else if (this.sSize == "large") {
            this.sSubTotal += largeShawarmaPrice;
          }
        }
        else if (this.sItem.toLowerCase() == "burrito") {
          if (this.sSize == "small") {
            this.sSubTotal += smallBurritoPrice;
          }
          else if (this.sSize == "regular") {
            this.sSubTotal += regularBurritoPrice;
          }
          else if (this.sSize == "large") {
            this.sSubTotal += largeBurritoPrice;
          }
        }
        else if (this.sItem.toLowerCase() == "hamburger") {
          if (this.sSize == "small") {
            this.sSubTotal += smallHamBurgerPrice;
          }
          else if (this.sSize == "regular") {
            this.sSubTotal += regularHamBurgerPrice;
          }
          else if (this.sSize == "large") {
            this.sSubTotal += largeHamBurgerPrice;
          }
        }
        aReturn.push("would you like to order more?");
        break;
      case OrderState.INVOICE:
        if (sInput.toLowerCase() == "yes") {
          aReturn.push("please type 'OK' to continue!");
          this.stateCur = OrderState.WELCOMING;
        }
        else {
          this.stateCur = OrderState.PAYMENT;
          //after all order execute here for bill payment and pickup time
          aReturn.push("Thank-you for your order of");
          aReturn.push(this.sMessage);
          this.sTax = this.sSubTotal * tax;
          this.sTotalCost = this.sSubTotal + this.sTax;
          aReturn.push(`Total Cost  :$ ${this.sTotalCost.toFixed(2)}`);
          aReturn.push(`Please pay for your order here`);
          aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
        }
        break;
      case OrderState.PAYMENT:
        shippingAddress = sInput.purchase_units[0].shipping.address;
        this.isDone(true);
        console.log(sInput);
        let d = new Date();
        d.setMinutes(d.getMinutes() + 20);
        aReturn.push(`Payment Successfull.Your order will be delivered to "${shippingAddress.address_line_1},${shippingAddress.admin_area_2},
                   ${shippingAddress.admin_area_1}, ${shippingAddress.postal_code} at ${d.toTimeString()}`);
        break;
    }
    return aReturn;
  }

  renderForm(sTitle = "-1", sAmount = "-1") {
    // your client id should be kept private
    if (sTitle != "-1") {
      this.sItem = sTitle;
    }
    if (sAmount != "-1") {
      this.nOrder = sAmount;
    }
    const sClientID = process.env.SB_CLIENT_ID || 'put your client id here for testing ... Make sure that you delete it before committing'
    return (`
      <!DOCTYPE html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your order costs $${this.sTotalCost.toFixed(2)}.
        <div id="paypal-button-container"></div>
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.sTotalCost.toFixed(2)}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `);

  }
}