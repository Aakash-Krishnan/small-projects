// ! TODO: Work on the security levels of the Entities details.
/**
 * @params {String} name
 * @params {String} dob - "yyyy-mm-dd"
 * @params {String} gender - "M" for Male, "F" for Female, "O" for Others.
 */
class Person {
  static #usersDB = new Map();

  constructor({ name, dob, gender }) {
    if (!name || name.length < 3) {
      throw new Error("Name should be atleast 3 characters long");
    }
    if (!dob) {
      throw new Error("Date of Birth is required");
    }

    if (!gender) {
      throw new Error("Please provide your gender");
    }

    this.id = this.#generateID(name);
    this.name = name;
    this.dob = new Date(dob);
    this.gender = gender;
    this.aadhar = null;
    this.pan = null;
    this.isLinked = false;
    this.age = this.getAge();
    this.account = null;
    // this.accounts = [];  // TODO: To store multiple accounts of a person.
  }

  #generateID(name) {
    name = name.toLowerCase().split(" ").join("_");
    let id;
    do {
      id = "";
      id = `${name}_${Date.now()}`;
    } while (Person.#usersDB.has(id));
    Person.#usersDB.set(id, this);
    return id;
  }

  getAge() {
    const today = new Date();
    let age = today.getFullYear() - this.dob.getFullYear();
    const m = today.getMonth() - this.dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < this.dob.getDate())) {
      age--;
    }
    return age;
  }

  createAadhar() {
    if (!this.aadhar) {
      this.aadhar = new Aadhar({ person: this });
    } else {
      console.warn("Aadhar already exists");
      return;
    }
  }

  /**
   *
   * @param {String} type - (P for Individual, F for Firm, C for Company, H for HUF, A for AOP, T for Trust, etc.).
   */
  createPAN(type = "P") {
    if (!this.pan) {
      this.pan = new PAN({ person: this, type });
    } else {
      console.warn("PAN already exists");
      return;
    }
  }

  linkAadharAndPan() {
    if (this.isLinked) {
      throw new Error("Aadhar and PAN are already linked");
    }
    if (!this.aadhar || !this.pan) {
      throw new Error("You need to have both the card before linking.");
    }
    this.aadhar.pan = this.pan;
    this.pan.aadhar = this.aadhar;
    this.isLinked = true;
  }

  /**
   * @params {String} pwd - length > 3
   * @params {Number} initialDeposit
   * @params {Bank} selectedBank
   */
  openBankAccount({ pwd, initialDeposit, selectedBank }) {
    if (!(selectedBank instanceof Bank)) throw new Error("Invalid Bank");
    if (!this.aadhar && !this.pan) {
      throw new Error("Need to have Aadhar or PAN to open an account");
    }

    const newAccount = new Account({
      userName: this.name,
      pwd,
      initialDeposit,
      bankName: selectedBank.bankName,
      proof: this.aadhar,
    });
    selectedBank.openAccount(newAccount);
    this.account = newAccount;

    console.log(`
        ********** ACCOUNT CREATED **************
        Your Account [${newAccount.accountNo}] has been created in [${
      newAccount.bankName
    }] Bank.
        ***Account Details***
              Name:             [${newAccount.userName}],
              Account Number:   [${newAccount.accountNo}],
              current Balance:  [Rs ${newAccount.balance}],
              Bank:             [${newAccount.bankName}],
              submitted proof:  [${
                newAccount.hasProof instanceof Aadhar ? "Aadhar" : "PAN"
              }]
      `);
  }

  static getUsers() {
    return Person.#usersDB;
  }
}

/**
 * @params {Person} person
 */
class Aadhar {
  // static aadharNumberDB = new Set();
  static #personDB = new Map();

  constructor({ person }) {
    if (!person instanceof Person) {
      throw new Error("Invalid Person");
    }
    if (person.aadhar) {
      throw new Error("Aadhar already exists");
    }

    this.id = this.#generateID();
    this.name = person.name;
    this.age = person.age;
    this.pan = null;

    Aadhar.#personDB.set(this.id, person);
  }

  #generateID() {
    let id;
    do {
      id = "";
      id += Math.floor(Math.random() * 8) + 1;
      for (let i = 0; i < 11; i++) {
        id += Math.floor(Math.random() * 9);
      }
    } while (Aadhar.#personDB.has(id));
    // Aadhar.personDB.add(id);
    return id;
  }

  // static validateCard(card) {
  //   const aadharDetails = Aadhar.personDB.get(card.id);
  // }
}

/**
 * @params {Person} person
 * @params {String} type
 */
class PAN {
  // static #panNumberDB = new Set();
  static #personDB = new Map();

  constructor({ person, type }) {
    // TODO: To check the instance of the person.
    if (!person instanceof Person) {
      throw new Error("Invalid Person");
    }
    if (person.pan) {
      throw new Error("PAN already exists");
    }

    this.name = person.name;
    this.id = this.#generateID(type);
    this.age = person.age;
    this.aadhar = null;

    PAN.#personDB.set(this.id, person);
  }

  #generateID(type) {
    let id;
    do {
      id = "";
      for (let i = 0; i < 3; i++) {
        id += String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
      id += this.name[0].toUpperCase();
      id += type;
      for (let i = 0; i < 4; i++) {
        id += Math.floor(Math.random() * 9);
      }
      id += String.fromCharCode(65 + Math.floor(Math.random() * 26));
    } while (PAN.#personDB.has(id));
    return id;
  }
}

/**
 * @params {String} userName
 * @params {String} pwd
 * @params {Number} initialDeposit
 * @params {String} bankName
 * @params {Aadhar | PAN} proof
 * @params {String} ifscCode
 */
class Account {
  static accountNumberDB = new Set();
  // static #accountsDB = new Map();

  #pwd;
  constructor({
    userName,
    pwd,
    initialDeposit,
    bankName,
    proof,
    ifscCode = null,
  }) {
    if (!userName || userName.length < 3) {
      throw new Error("Need more characters for your userName");
    }
    if (!pwd || pwd.length < 3) {
      throw new Error("Need more characters in pwd");
    }
    if (isNaN(Number(initialDeposit))) {
      throw new Error("Need an initial amount to open an Account");
    }

    if (!proof)
      throw new Error("Need to have an Aadhar or PAN to open an account");
    if (!(proof instanceof Aadhar) && !(proof instanceof PAN)) {
      console.log("PROOF", proof);
      throw new Error("Invalid proof: proof has to be either Aadhar or PAN");
    }
    this.userName = this.parseUserName(userName);
    this.#pwd = pwd;
    this.accountNo = this.#generateID();
    this.balance = initialDeposit;
    this.bankName = bankName;
    this.hasProof = proof;
    this.transactionHistory = [];

    // this.ifscCode = ifscCode;
  }

  parseUserName(userName) {
    return userName.toLowerCase().split(" ").join("_");
  }

  #generateID() {
    let id;
    do {
      id = "";
      id += Math.floor(Math.random() * 8) + 1;
      for (let i = 0; i < 13; i++) {
        id += Math.floor(Math.random() * 9);
      }
    } while (Account.accountNumberDB.has(id));
    Account.accountNumberDB.add(id);
    return id;
  }

  /**
   *
   * @param {Number} amount
   */
  deposit(amount) {
    const amt = parseInt(amount);
    if (isNaN(amt)) {
      throw new Error("Amount needs to be an Number");
    }
    if (amt < 1) {
      throw new Error("Amount needs to be greater than Zero");
    }

    this.balance += amt;
    console.warn(`
    [${this.userName}]: amount ${amt} has been credited to your account ${this.accountNo}`);

    this.transactionHistory.push({
      type: "deposit",
      amt,
      balance: this.balance,
    });
  }

  /**
   *
   * @param {Number} amount
   * @param {Boolean} transferCharges - default false, if true the transfer charges will be deducted.
   */
  withdraw(amount, transferCharges = false) {
    const amt = parseFloat(amount);
    if (isNaN(amt)) {
      throw new Error("Amount needs to be an Number");
    }
    if (amt < 1) {
      throw new Error("Amount needs to be greater than Zero");
    }
    if (amt > this.balance) {
      throw new Error("Insufficient balance");
    }

    this.balance -= amt;

    transferCharges
      ? console.warn(`
      [${this.userName}]: amount ${amt} has been debited from your account ${this.accountNo} for transaction fee`)
      : console.warn(`
    [${this.userName}]: amount ${amt} has been debited from your account ${this.accountNo}`);

    this.transactionHistory.push({
      type: "withdraw",
      amt,
      balance: this.balance,
    });
  }

  /**
   *
   * @param {Account} to
   * @param {Number} amount
   * @param {String} pwd
   */
  transferTo(to, amount, pwd) {
    if (pwd !== this.#pwd) {
      throw new Error("Incorrect password");
    }
    if (!(to instanceof Account)) {
      throw new Error("Incorrect Account type");
    }
    this.withdraw(amount);
    if (to.bankName !== this.bankName) {
      this.withdraw(5.97, true);
    }
    to.deposit(amount);
  }

  displayBalance() {
    console.log(`
      ********** BALANCE **************
      Account Number: ${this.accountNo}
      [${this.userName}] your balance is: ${this.balance}
      `);
  }

  displayTransactionHistory() {
    console.log(`******Statement******`);
    this.transactionHistory.forEach((transaction) => {
      transaction.type === "deposit"
        ? console.log(`
Holder:  [${this.userName}]
Amount:  Rs ${transaction.amt} 
    deposited to 
Account: [${this.accountNo}]
Balance: Rs ${transaction.balance}
        `)
        : console.log(`
Holder:  [${this.userName}]
Amount:  Rs ${transaction.amt}
    widthdrawn from 
Account: [${this.accountNo}]
Balance: Rs ${transaction.balance}
          `);
    });
  }
}

// TODO: Create a IFSC codes for each banks. By getting number of branches and create a random codes.
class Bank {
  static banksDB = new Map();

  constructor({ bankName }) {
    if (Bank.banksDB.has(bankName)) {
      console.log(Bank.banksDB);
      throw new Error("Bank already exists");
    }

    this.bankName = bankName;
    this.accountsDB = new Map();
  }

  static createBank(bankName) {
    Bank.banksDB.set(bankName, new Bank({ bankName }));
  }

  openAccount(account) {
    if (!(account instanceof Account)) {
      throw new Error("Incorrect Account type");
    }
    if (this.accountsDB.has(account.accountNo)) {
      throw new Error("Account already exist");
    }

    this.accountsDB.set(account.accountNo, account);
    return account;
  }

  getAccountById(id) {
    if (!this.accountsDB.has(id)) {
      throw new Error("No account found");
    }
    return this.accountsDB.get(id);
  }
}

// TODO: Convert the functions to front-end.
// Bank.createBank("HDFC");
// Bank.createBank("AXIS");

// console.log("BANKS", Bank.banksDB);
// const userX = new Person({
//   name: "User X",
//   dob: "2000-11-24",
//   gender: "M",
// });

// const userY = new Person({
//   name: "User Y",
//   dob: "2001-01-01",
//   gender: "M",
// });

// userX.createAadhar();

// userX.openBankAccount({
//   pwd: "ux123",
//   initialDeposit: 1000,
//   selectedBank: Bank.banksDB.get("HDFC"),
// });

// userY.createAadhar();
// userY.createPAN("F");

// userY.openBankAccount({
//   pwd: "uy123",
//   initialDeposit: 15009,
//   selectedBank: Bank.banksDB.get("AXIS"),
// });

// TODO: Improve the transTo function to more simplified.
// Bank.banksDB
//   .get("HDFC")
//   .getAccountById(userX.account.accountNo)
//   .transferTo(
//     Bank.banksDB.get("AXIS").getAccountById(userY.account.accountNo),
//     100,
//     "ux123"
//   );

// userY.linkAadharAndPan();
// console.log("UserY details", userY.aadhar.pan.aadhar.pan);

// userX.account.displayBalance();
// userY.account.displayBalance();

// let users = Person.getUsers();

// console.log(Bank.banksDB.get("HDFC"));
// console.log("USERS:", users);

// userX.account.displayTransactionHistory();
// userY.account.displayTransactionHistory();
