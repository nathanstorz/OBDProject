// index.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const User = require('./models/User'); // Assumes User model is in models/User.js
const app = express();
const port = 3001;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // To serve static files, like CSS

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/obdproject', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Serve login page
app.get('/', (req, res) => {
  res.send(`
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }

          .login-container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
          }

          h2 {
            text-align: center;
            color: #333;
          }

          label {
            display: block;
            margin: 10px 0 5px;
            font-weight: bold;
            color: #333;
          }

          input {
            width: 100%;
            padding: 10px;
            margin: 5px 0 15px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
          }

          button {
            width: 100%;
            padding: 10px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }

          button:hover {
            background-color: #0056b3;
          }

          p {
            text-align: center;
            color: #333;
          }

          a {
            color: #007bff;
            text-decoration: none;
          }

          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="login-container">
          <h2>Login</h2>
          <form action="/login" method="POST">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required>
            
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
            
            <button type="submit">Login</button>
          </form>
          <p>Don't have an account? <a href="/signup">Sign up here</a></p>
        </div>
      </body>
    </html>
  `);
});


// Serve signup page
app.get('/signup', (req, res) => {
  res.send(`
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .form-container {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
          }
          h2 {
            text-align: center;
            margin-bottom: 20px;
            color: #333;
          }
          label {
            display: block;
            margin: 10px 0 5px;
            color: #333;
          }
          input[type="text"], input[type="password"], input[type="number"] {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
          }
          button {
            width: 100%;
            padding: 10px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }
          button:hover {
            background-color: #45a049;
          }
          .link {
            text-align: center;
            margin-top: 10px;
          }
          .link a {
            color: #007BFF;
            text-decoration: none;
          }
          .link a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="form-container">
          <h2>Sign Up</h2>
          <form action="/signup" method="POST">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required>

            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>

            <label for="carBrand">Car Brand:</label>
            <input type="text" id="carBrand" name="carBrand" required>

            <label for="carModel">Car Model:</label>
            <input type="text" id="carModel" name="carModel" required>

            <label for="carYear">Car Year:</label>
            <input type="number" id="carYear" name="carYear" required>

            <button type="submit">Sign Up</button>
          </form>
          <div class="link">
            <p>Already have an account? <a href="/login">Log in here</a></p>
          </div>
        </div>
      </body>
    </html>
  `);
});


// Handle signup form submission
app.post('/signup', async (req, res) => {
  try {
    const { username, password, carBrand, carModel, carYear } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, carBrand, carModel, carYear });
    await user.save();
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.send('Error during signup.');
  }
});

// Handle login form submission
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && await bcrypt.compare(password, user.password)) {
    res.redirect(`/main?username=${username}&carBrand=${user.carBrand}&carModel=${user.carModel}&carYear=${user.carYear}`);
  } else {
    res.send('Invalid credentials');
  }
});

// Main UI page after login
app.get('/main', async (req, res) => {
  const { username, carBrand, carModel, carYear } = req.query;

  res.send(`
    <style>
      /* Centered top title */
      h1 {
        text-align: center;
        margin-top: 20px;
      }

      /* Logo styling */
      .logo-link {
        position: absolute;
        top: 2px;
        left: 2px;
        display: inline-block;
      }

      .logo {
        width: 100px;
        height: auto;
        cursor: pointer;
      }

      

      /* Bluetooth button styling */
      .bluetooth-button {
        display: block;
        margin: 40px auto;
        padding: 30px 60px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 15px;
        font-size: 30px;
        cursor: pointer;
        text-align: center;
      }

      .bluetooth-button:hover {
        background-color: #0056b3;
      }

      /* Styling for the loading and connection text */
      .status-text {
        text-align: center;
        font-size: 24px;
        margin-top: 20px;
      }

      /* Styling for the Bluetooth logo */
      .bluetooth-logo {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 40px;
        height: auto;
        display: none;
      }

      /* Car image styling */
      .car-image {
        display: none; /* Hidden initially */
        width: 300px; /* Adjust the width as needed */
        margin: 20px auto;
      }

      /* Button grid styling */
      .button-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        position: absolute;
        bottom: 50px;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 600px;
      }

      .button-grid button {
        width: 200px; /* Set a fixed size for grid items */
        height: 200px; /* Keep the squares uniform */
        background-color: #000000;
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
      }

      .button-grid button img {
        max-width: 95%; /* Image scales within the button */
        max-height: 95%; /* Ensures the image fits */
        object-fit: contain; /* Ensures proper scaling */
      }
      .button-grid button:hover {
        background-color: #0056b3;
      }
    </style>

    <body>
      <!-- Logo link with preserved query parameters -->
      <a href="/main?username=${username}&carBrand=${carBrand}&carModel=${carModel}&carYear=${carYear}" class="logo-link">
        <img src="/images/obdlogo.png" alt="Logo" class="logo">
      </a>

      <!-- Welcome heading -->
      <h1>Welcome to the OBD UI</h1>

      <!-- Car Info Panel -->
      <div class="info-panel">
  <h3>Car Information</h3>
  <p><strong>Username:</strong> ${username}</p>
  <p><strong>Car Brand:</strong> ${carBrand}</p>
  <p><strong>Model:</strong> ${carModel}</p>
  <p><strong>Year:</strong> ${carYear}</p>
</div>

      <!-- Bluetooth Scan Button -->
      <button class="bluetooth-button" id="bluetooth-btn">Bluetooth Scan</button>

      <!-- Status Text (hidden initially) -->
      <div class="status-text" id="status-text" style="display: none;">
        Loading...
      </div>

      <!-- Bluetooth Logo (hidden initially) -->
      <img src="/images/bluetooth.png" alt="Bluetooth Logo" class="bluetooth-logo" id="bluetooth-logo" />

      <!-- Car Image (hidden initially) -->
      <img src="/images/civic.png" alt="${carYear} ${carBrand} ${carModel}" class="car-image" id="car-image" />

      <!-- Button Grid -->
      <div class="button-grid">
        <button id="button3d">
          <img src="/images/icon3d.png" alt="3D Icon">
        </button>
<button id="button2">
    <img src="/images/battery.jpg" alt="Battery Icon">
  </button>
<button id="button3">
    <img src="/images/engine.png" alt="Engine Icon">
  </button>        
<button id="button4">
    <img src="/images/settings.png" alt="Settings Icon">
  </button>
<button id="button5">
    <img src="/images/data.png" alt="Data Icon">
  </button>
<button id="button6">
    <img src="/images/lib.png" alt="Library Icon">
  </button>      </div>
      
      <script>
        // Check connection status on page load
        window.onload = function() {
          if (sessionStorage.getItem('isConnected') === 'true') {
            // Show the connected message, Bluetooth logo, and car image
            document.getElementById('status-text').innerText = 'Connected to ${carYear} ${carBrand} ${carModel}';
            document.getElementById('status-text').style.display = 'block';
            document.getElementById('bluetooth-logo').style.display = 'block';
            document.getElementById('car-image').style.display = 'block'; // Show the car image
            document.getElementById('bluetooth-btn').style.display = 'none'; // Hide the Bluetooth button
          }
        };
        // Handle Button 2 click to redirect to /battery
        document.getElementById('button2').addEventListener('click', function() {
          window.location.href = '/battery?username=${username}&carBrand=${carBrand}&carModel=${carModel}&carYear=${carYear}';
        });
        // Handle Bluetooth button click
        document.getElementById('bluetooth-btn').addEventListener('click', function() {
          // Hide the button and show loading text
          this.style.display = 'none';
          document.getElementById('status-text').style.display = 'block';
          document.getElementById('status-text').innerText = 'Loading...';
          
          // Simulate connection delay
          setTimeout(function() {
            document.getElementById('status-text').innerText = 'Connected to ${carYear} ${carBrand} ${carModel}';
            
            // Show the Bluetooth logo and car image after connection
            document.getElementById('bluetooth-logo').style.display = 'block';
            document.getElementById('car-image').style.display = 'block'; // Show the car image

            // Store connection status in sessionStorage
            sessionStorage.setItem('isConnected', 'true');
          }, 2000);
        });
        // Redirect to /3d when the "3D" button is clicked
        document.getElementById('button3d').addEventListener('click', function() {
          window.location.href = '/3d?username=${username}&carBrand=${carBrand}&carModel=${carModel}&carYear=${carYear}';
        });
      </script>
      <div class="contact-us">
        <div class="section-title">Contact Us</div>
        <div class="info-content">
          <div class="contact-item">
            Nathan Storz - <a href="mailto:storzn@gmail.com">storzn@rider.eedu</a>
          </div>
          <div class="contact-item">
            Ny'eem McFadden - <a href="mailto:mcfaddenn@rider.edu">mcfaddenn@rider.edu</a>
          </div>
          <div class="contact-item">
            Dylan LeRay - <a href="mailto:lerayd@rider.edu">lerayd@rider.edu</a>
          </div>
          <div class="contact-item">
            Thomas Sperduto - <a href="mailto:sperdutot@rider.edu">sperdutot@rider.edu</a>
          </div>
        </div>
      </div>
      <style>
  /* Styling for the Contact Us box */
.contact-us {
  position: absolute;
  bottom: 10px; /* Adjusts how far from the bottom */
  left: 10px; /* Adjusts how far from the left */
  width: 300px; /* Fixed width */
  background-color: #fff; /* White background */
  border: 1px solid #ccc; /* Light border */
  border-radius: 10px; /* Rounded corners */
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  padding: 15px; /* Internal padding */
  font-family: Arial, sans-serif; /* Consistent font */
  font-size: 14px;
  color: #333; /* Text color */
}

.contact-us .section-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 10px;
}

.contact-us .info-content {
  margin-top: 10px;
}

.contact-us .contact-item {
  margin-bottom: 5px;
}

.contact-us .contact-item a {
  color: #007bff;
  text-decoration: none;
}

.contact-us .contact-item a:hover {
  text-decoration: underline;
}
/* Car Info Panel */
  .info-panel {
    background-color: #ffffff; /* White background for clean look */
    padding: 20px;
    border: 1px solid #000; /* Thin black border */
    border-radius: 15px; /* Rounded corners for modern design */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Soft shadow for depth */
    width: 250px; /* A bit wider for more space */
    position: absolute;
    top: 120px; /* Adjust the position */
    left: 10px;
    font-family: 'Arial', sans-serif;
    font-size: 16px; /* Slightly larger font size */
    color: #333; /* Dark text for readability */
  }

  /* Title for Car Info Panel */
  .info-panel h3 {
    text-align: left;
    font-size: 18px;
    margin-bottom: 15px;
    color: #000000; /* Primary color for heading */
    font-weight: bold;
  }

  /* Car Info Text */
  .info-panel p {
    margin: 8px 0;
    line-height: 1.6;
  }

  /* Label styling */
  .info-panel strong {
    font-weight: bold;
    color: #555; /* Slightly lighter color for labels */
  }

  /* Add a subtle hover effect when mouse hovers over the info panel */
  .info-panel:hover {
    transform: scale(1.02); /* Slight zoom effect */
    transition: transform 0.3s ease;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1); /* Deeper shadow on hover */
  }
</style>
    </body>
  `);
});

app.get('/3d', (req, res) => {
  const { username, carBrand, carModel, carYear } = req.query;

  res.send(`
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #f4f4f4;
      }

      .logo-link {
        position: absolute;
        top: 2px;
        left: 2px;
        cursor: pointer;
      }

      .logo {
        width: 100px;
        height: auto;
      }

      .title {
        font-size: 24px;
        color: #333;
        margin-bottom: 20px;
      }

      .image-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        max-width: 500px;
        margin-bottom: 20px;
      }

      .image-grid img {
        width: 100%;
        height: auto;
        object-fit: cover;
        aspect-ratio: 1;
        border-radius: 10px;
        border: 2px solid #ccc;
      }

      .footer {
        font-size: 18px;
        color: #333;
        margin-top: 10px;
      }
    </style>

    <body>
      <a href="/main?username=${username}&carBrand=${carBrand}&carModel=${carModel}&carYear=${carYear}" class="logo-link">
        <img src="/images/obdlogo.png" alt="Logo" class="logo">
      </a>

      <div class="title">
        3D Model of ${carYear} ${carBrand} ${carModel}
      </div>

      <div class="image-grid">
        <img src="/images/photo1.png" alt="Photo 1">
        <img src="/images/photo2.png" alt="Photo 2">
        <img src="/images/photo3.png" alt="Photo 3">
        <img src="/images/photo4.png" alt="Photo 4">
      </div>

      <div class="footer">
        There are 0 issues detected with your car.
      </div>
    </body>
  `);
});

app.get('/battery', (req, res) => {
  res.send(`
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f0f0f0;
        height: 100%; /* Ensure the body takes full height */
        display: flex;
        flex-direction: column;
        justify-content: space-between; /* Space content between top and bottom */
      }

      /* Logo styling */
      .logo {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 100px;
        height: auto;
      }

      /* Content section styling */
      .container {
        padding-top: 0px; /* Move the "Car Battery Percentage" 15px from the top */
        text-align: center;
        font-size: 24px;
      }

      /* Battery percentage text */
      .battery-percentage {
        font-size: 60px;
        font-weight: bold;
        color: #333;
        margin-top: 20px;
      }

      /* Bottom battery image */
      .battery-image {
        width: 50%; /* Set the width to half of the screen */
        align-self: center; /* Center the image horizontally */
        margin-bottom: 20px; /* Space from the bottom */
      }

      /* Adjust padding so the content doesn't overlap with the battery image */
      .content {
        padding-bottom: 100px; /* Adjust based on image size */
      }
    </style>

    <body>
      <!-- Logo link -->
      <a href="/main?username=${req.query.username}&carBrand=${req.query.carBrand}&carModel=${req.query.carModel}&carYear=${req.query.carYear}">
        <img src="/images/obdlogo.png" alt="Logo" class="logo">
      </a>

      <!-- Content for /battery -->
      <div class="container">
        <h1>Car Battery Percentage</h1>
        <p>Voltage: 12.3 Volts</p>
        <div class="battery-percentage">75%</div> <!-- Big text for battery percentage -->
      </div>

      <!-- Battery image at the bottom -->
      <img src="/images/battery.png" alt="Battery" class="battery-image">
    </body>
  `);
});


// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
