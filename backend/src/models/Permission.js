import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Permission name is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z_]+:[a-z_]+$/, 'Permission name must follow format resource:action (e.g., invoices:create)']
  },
  module: {
    type: String,
    required: [true, 'Module name is required'],
    trim: true,
    minlength: [2, 'Module name must be at least 2 characters'],
    maxlength: [30, 'Module name cannot exceed 30 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

export default mongoose.model("Permission", permissionSchema);
