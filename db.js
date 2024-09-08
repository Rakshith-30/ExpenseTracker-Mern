import mongoose from "mongoose";

async function connect() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 
      mongodb+srv://21bd1a051kcsea:Rakshith2003$@expense.akzdt.mongodb.net/,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("MongoDB connection is successful");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1); // Exit the process with failure
  }
}

export default connect;