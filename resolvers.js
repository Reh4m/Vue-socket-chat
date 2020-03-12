const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createToken = ( user, secret, expiresIn ) => {
  const { username, email } = user;
  return jwt.sign({ username, email }, secret, { expiresIn });
};

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
module.exports = {
  Query: {
    getCurrentUser: async (_, args, { User, currentUser }) => {
      if (!currentUser) {
        return null;
      };
      const user = await User.findOne({
        username: currentUser.username
      }).populate({
        path: "favorites",
        model: "Post"
      });
      return user;
    },
    getUser: async (_, { userId }, { User }) => {
      const user = await User.findOne({ _id: userId }).populate({
        path: "favorites",
        model: "Post"
      });
      return user;
    },
  },
  Mutation: {
    signinUser: async (_, { username, password }, { User }) => {
      const user = await User.findOne({ username });

      if (!user) {
        throw new Error("User not found");
      };

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new Error("Invalid password");
      };

      return { token: createToken(user, process.env.SECRET, "48hr") };
    },
    signupUser: async (_, { username, email, password }, { User }) => {
      const findUser = await User.findOne({ username });
      const findEmail = await User.findOne({ email });

      if (findUser) {
        throw new Error("User already exist");
      };

      if (findEmail) {
        throw new Error("Email already exist");
      };

      const newUser = await new User({
        username,
        email,
        password
      }).save();

      return { token: createToken(newUser, process.env.SECRET, "48hr") };
    }
  }
};