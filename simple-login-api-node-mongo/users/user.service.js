const config = require('config.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const User = db.User;
const UserLog =  db.UserLog;

module.exports = {
    authenticate,
    logout,
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    getaudit,
    auditorCheck,
};

async function authenticate({ username, password }, ip) {
    const user = await User.findOne({ username });
    if (user && bcrypt.compareSync(password, user.hash)) {
        const logs = new UserLog({
            userId : user._id,
            _ip : ip,
        })

        await logs.save()

        const { hash, ...userWithoutHash } = user.toObject();
        const token = jwt.sign({ sub: user.id }, config.secret);
        const logid = logs._id ;
        return {
            ...userWithoutHash,
            token,
            logid,
        };
    }
}

async function logout(token,logId){
    let userid;
    try {
        const decoded = jwt.verify(token,config.secret );
        if (decoded && decoded.sub) {
             userid = decoded.sub
        } else {
            console.log('The token does not have a sub claim.');
        }
    } catch (err) {
        console.log('Error verifying or decoding the token:', err.message);
    }

    
    await UserLog.findByIdAndUpdate(logId, {
        logoutTime: Date.now()
    });
}

async function getAll() {
    return await User.find().select('-hash');
}

async function getById(id) {
    return await User.findById(id).select('-hash');
}

async function create(userParam) {
    // validate
    if (await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    const user = new User(userParam);

    // hash password
    if (userParam.password) {
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // save user
    await user.save();
}

async function update(id, userParam) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    // hash password if it was entered
    if (userParam.password) {
        userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // copy userParam properties to user
    Object.assign(user, userParam);

    await user.save();
}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}

async function getaudit(){
    try{
        return await UserLog.find()
        .populate('userId', 'firstName username role')
        .sort({ 'loginTime': -1 });
    }catch(err){
        console.log(err)
    }
}

async function auditorCheck(req, res, next) {
    const user = await User.findById(req.user.sub);
    if (user && user.role === 'Auditor') {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}