const verificationEmailTemplate = (url) => {
  let template = `
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap");
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        text-align: center;
      }

      body {
        display: flex;
        max-width: 100vw;
        justify-content: center;
        align-items: center;
        font-family: "Rubik";
      }

      .container {
        padding: 20px;
        background: #eeeeee;
        margin: 20px;
        border-radius: 10px;
      }

      hr {
        margin: 10px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Thankyou for Showing your interest</h1>
      <hr />
      <p>For verification you can click <a href="${url}">Here</a></p>
      <p>Or</p>
      <p>You can copy paste <br />${url} <br />In any browser</p>
      <p>Thanks again for trusting us</p>
    </div>
  </body>
</html>

  
  `;

  return template;
};

export default verificationEmailTemplate;
