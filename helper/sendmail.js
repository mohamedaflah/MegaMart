const transporter = require("../auth/nodmaile");
require("dotenv").config();
function sendMailforUser(email, subject, content) {
  try {
    const mailOption = {
      from: process.env.USER_EMAIL,
      to: email,
      subject: subject,
      html: `    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
              <div style="border-bottom:1px solid #eee">
                <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">MegaMart</a>
              </div>
              <p style="font-size:1.1em">Hi,</p>
              <p>Thank you for choosing Your Brand. Use the following OTP to complete your Sign Up Your Secret Password</p>
              <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${content}</h2>
              <p style="font-size:0.9em;">Regards,<br />MegaMart</p>
              <hr style="border:none;border-top:1px solid #eee" />
              <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                <p>MegaMart Inc</p>
                <p>1600 Amphitheatre Parkway</p>
                <p>India</p>
              </div>
            </div>
          </div>`,
    };
    transporter.sendMail(mailOption, (err, info) => {
      if (err) {
        console.log("Error in Sending Mail", err);

        res.status(500).json({ err: "Error in sending pass" });
      } else {
        console.log("Mail sended", info.response);
      }
    });
  } catch (err) {
    console.log("Error in sending Mail " + err);
  }
}
function sendOtp(maincontent, from, to, subject) {
  return new Promise((resolve,reject)=>{
    const mailOptions = {
      from: from,
      to: to,
      subject: subject,
      html: `    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
       <div style="margin:50px auto;width:70%;padding:20px 0">
         <div style="border-bottom:1px solid #eee">
           <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">MegaMart</a>
         </div>
         <p style="font-size:1.1em">Hi,</p>
         <p>Thank you for choosing Your Brand. Use the following OTP to complete your Sign Up procedures. OTP is valid for 1 minutes</p>
         <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${maincontent}</h2>
         <p style="font-size:0.9em;">Regards,<br />MegaMart</p>
         <hr style="border:none;border-top:1px solid #eee" />
         <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
           <p>MegaMart Inc</p>
           <p>1600 Amphitheatre Parkway</p>
           <p>India</p>
         </div>
       </div>
     </div>`,
    };
  
    // await transporter.sendMail(mailOptions)
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        // res.status(500).json({
        //   err: "An error occurred while sending the confirmation email.",
        // });
        reject({status:false})
      } else {
        console.log("Email sent:", info.response);
        console.log("code in 201_________" + codEmai);
        // res.status(201).redirect("/mail/confirm");
        // res.status(200).json({ status: true });
        resolve({status:true})
      }
    });
  })
}
module.exports = { sendMailforUser, sendOtp };
