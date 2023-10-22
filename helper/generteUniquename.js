function generateUniqueUsername(name) {
    // Logic to generate username suggestions
    // This could involve adding numbers, appending initials, etc.
    return name.toLowerCase().replace(/\s/g, '_') + Math.floor(Math.random() * 1000);
  }
module.exports={generateUniqueUsername} 