// function action(bp: typeof sdk,  event: sdk.IO.IncomingEvent, args: any, {user, temp, session } = event.state){
  /**
   * Get price of stock as per ticker symbol
   * @title whatsApp
   * @category Message_WhatsApp
   * @author Rhizicube
   * @param {string} wa - The Ticker Symbol
   */
  const axios = require("axios")

  const myAction = async (wa) => {
    var data = JSON.stringify({
      text: wa.payload.text,
      type: 'text',
       phone_number_id: "108603772099729",
       from: "15550227728",
    })
   

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'http://localhost:3002/webhook',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': 'Bearer EAARB9ujTATsBAK9h47jw7UtfZBCZCnfaZB9n9QFS3OtHgiALUdxy2omJiKkZAU4Pmd5bVQZCFfVL7ZA5hsTZAIA7YmtoOLxDhL7kuN1lYHann1ya23xVvjhLWKQEW1l00KbMTOhzoHksVfmvzN8EOV5ZBtfodDdGD94ekDH22bpkO3pYWKEZA0zER41cFK6pSIZB07oAnkZA7JoMQZDZD'
      },
      data : data
    };
    
   const waRes =  axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
    const currentData = waRes.data
     temp.currentData = currentData
    
  }

  return myAction(args.wa)
// }