# CREATE TABLE admins (
# 	Id INT AUTO_INCREMENT UNIQUE NOT NULL,
# 	Email VARCHAR(60) PRIMARY KEY,
# 	Username VARCHAR(60) NOT NULL,
# 	Password VARCHAR(255) NOT NULL
# );

# CREATE TABLE users(
# 	Id INT AUTO_INCREMENT UNIQUE NOT NULL,
# 	Email VARCHAR(60) PRIMARY KEY,
# 	Username VARCHAR(60) NOT NULL,
# 	Password VARCHAR(255) NOT NULL
# );

# CREATE TABLE currency(
# 	Id INT AUTO_INCREMENT UNIQUE NOT NULL,
# 	Type VARCHAR(3) PRIMARY KEY
# );

# CREATE TABLE Accounts (
#   Id INT AUTO_INCREMENT UNIQUE NOT NULL,
#   User_Email VARCHAR(70) UNIQUE NOT NULL,
#   Account_No BIGINT PRIMARY KEY,
#   Currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
#   Balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
#   Account_Type ENUM('Savings', 'Current', 'Fixed') NOT NULL,
#   Status BOOLEAN DEFAULT TRUE NOT NULL,
#   Created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
#   Last_Updated DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
#   FOREIGN KEY (User_Email) REFERENCES users(Email) ON DELETE CASCADE,
#   FOREIGN KEY (Currency) REFERENCES currency(Type) ON DELETE CASCADE
# );

# CREATE TABLE Withdrawals (
#     Transaction_id VARCHAR(255) NOT NULL,
#     Amount DECIMAL(10, 2) NOT NULL,
#     Source_account BIGINT NOT NULL,
#     Created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
#     PRIMARY KEY (Transaction_id),
#     FOREIGN KEY (Source_account) REFERENCES Accounts(Account_No) ON DELETE CASCADE
# );

# CREATE TABLE Deposits (
#     Transaction_id VARCHAR(255) NOT NULL,
#     Amount DECIMAL(10, 2) NOT NULL,
#     Destination_account BIGINT NOT NULL,
#     Created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
#     PRIMARY KEY (Transaction_id),
#     FOREIGN KEY (Destination_account) REFERENCES Accounts(Account_No) ON DELETE CASCADE
# );

# CREATE TABLE Transfers (
#     Transaction_id VARCHAR(255) NOT NULL,
#     Amount DECIMAL(10, 2) NOT NULL,
#     Source_account BIGINT NOT NULL,
#     Destination_account BIGINT NOT NULL,
#     Created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
#     PRIMARY KEY (Transaction_id),
#     FOREIGN KEY (Source_account) REFERENCES Accounts(Account_No) ON DELETE CASCADE,
#     FOREIGN KEY (Destination_account) REFERENCES Accounts(Account_No) ON DELETE CASCADE
# );

# CREATE TABLE Bills (
#     Transaction_id VARCHAR(255) NOT NULL,
#     Type ENUM('airtime', 'betting', 'electricity', 'subscription') NOT NULL,
#     Amount DECIMAL(10, 2) NOT NULL,
#     Source_account BIGINT NOT NULL,
#     Created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
#     PRIMARY KEY (Transaction_id),
#     FOREIGN KEY (Source_account) REFERENCES Accounts(Account_No) ON DELETE CASCADE 
# );

# UPDATE Accounts
# SET Balance = Balance + 50000, Last_Updated = current_timestamp() 
# Where Account_No = 1378915902;

# SELECT * FROM accounts;

# SELECT Currency
# FROM Accounts
# WHERE Account_No = 6729690712 AND 5686642180;

# UPDATE Accounts
# SET Account_No = 5686642180
# WHERE User_Email = 'hzdelight01@gmail.com';

# SELECT Users.Email, Users.Username, Accounts.Account_No, Accounts.Balance, Accounts.Account_Type, Accounts.Currency
# FROM Users
# INNER JOIN Accounts ON Users.Email = Accounts.User_Email;

# SELECT COUNT(Status)
#     FROM Accounts
#     WHERE Account_No = 2098497891 AND Status = 1

