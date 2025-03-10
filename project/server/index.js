import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection (would be replaced with actual connection string)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-manager')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const transactionSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Define models
const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

// Create a demo user if it doesn't exist
const createDemoUser = async () => {
  try {
    const demoEmail = 'demo@exemplo.com';
    const demoPassword = 'senha123';
    
    // Check if demo user already exists
    const existingUser = await User.findOne({ email: demoEmail });
    if (!existingUser) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(demoPassword, salt);
      
      // Create new user
      const user = new User({
        email: demoEmail,
        password: hashedPassword
      });
      
      await user.save();
      console.log('Demo user created successfully');
    }
  } catch (error) {
    console.error('Error creating demo user:', error);
  }
};

// Call the function to create demo user
createDemoUser();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Acesso negado' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido ou expirado' });
    }
    
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = new User({
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email ou senha inválidos' });
    }
    
    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Email ou senha inválidos' });
    }
    
    // Create and assign token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );
    
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Transaction routes
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    let query = { userId: req.user.id };
    
    if (startDate) {
      query.date = { ...query.date, $gte: new Date(startDate) };
    }
    
    if (endDate) {
      query.date = { ...query.date, $lte: new Date(endDate) };
    }
    
    if (category) {
      query.category = category;
    }
    
    const transactions = await Transaction.find(query).sort({ date: -1 });
    
    res.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { description, amount, date, category, type } = req.body;
    
    const transaction = new Transaction({
      description,
      amount,
      date,
      category,
      type,
      userId: req.user.id
    });
    
    await transaction.save();
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

app.get('/api/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transação não encontrada' });
    }
    
    res.status(200).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

app.put('/api/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const { description, amount, date, category, type } = req.body;
    
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { description, amount, date, category, type },
      { new: true }
    );
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transação não encontrada' });
    }
    
    res.status(200).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transação não encontrada' });
    }
    
    res.status(200).json({ message: 'Transação excluída com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Dashboard route
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    // Get all transactions for the user
    const transactions = await Transaction.find({ userId: req.user.id });
    
    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = {};
    const monthlyData = {};
    
    transactions.forEach(transaction => {
      // Add to income or expense total
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
      } else {
        totalExpense += transaction.amount;
        
        // Add to category totals
        if (categoryTotals[transaction.category]) {
          categoryTotals[transaction.category] += transaction.amount;
        } else {
          categoryTotals[transaction.category] = transaction.amount;
        }
      }
      
      // Add to monthly data
      const month = transaction.date.toISOString().substring(0, 7); // Format: YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[month].income += transaction.amount;
      } else {
        monthlyData[month].expense += transaction.amount;
      }
    });
    
    // Format category totals for response
    const formattedCategoryTotals = Object.keys(categoryTotals).map(category => ({
      category,
      total: categoryTotals[category]
    }));
    
    // Format monthly data for response
    const formattedMonthlyData = Object.keys(monthlyData).map(month => ({
      month,
      income: monthlyData[month].income,
      expense: monthlyData[month].expense,
      balance: monthlyData[month].income - monthlyData[month].expense
    }));
    
    res.status(200).json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      categoryTotals: formattedCategoryTotals,
      monthlyData: formattedMonthlyData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});