module.exports = function(){
    switch(process.env.NODE_ENV){
        case 'test':
            return {
              'secret': '04050405',
              'database': 'mongodb://localhost:27017/messages_it',
              'logsDirectory': 'logs',
              'serviceName': 'messageservice',
              'emailServer': 'smtp.gmail.com',
              'emailPort': '465',
              'emailUser': 'jenkinsfintechinnovation@gmail.com',
              'emailPwd': 'yT{a8q:2J~4XJ%,DeR8.STCp!*'
            };
        default:
            return {
              'secret': '04050405',
              'database': 'mongodb://messageservicemongo:27017/messages',
              'logsDirectory': 'logs',
              'serviceName': 'messageservice',
              'emailServer': 'smtp.gmail.com',
              'emailPort': '465',
              'emailUser': 'jenkinsfintechinnovation@gmail.com',
              'emailPwd': 'yT{a8q:2J~4XJ%,DeR8.STCp!*'
            };
    }
};

