import mongoose, { Schema, InferSchemaType } from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 }
}, { timestamps: true });

UserSchema.pre("save", async function(next) {
  const user = this as any;
  if (!user.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export type UserDoc = InferSchemaType<typeof UserSchema> & {
  comparePassword(candidate: string): Promise<boolean>;
};

export default mongoose.models.User || mongoose.model<UserDoc>("User", UserSchema);
