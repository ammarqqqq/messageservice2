module.exports = function(){
    switch(process.env.NODE_ENV){
        case 'test':
            return {
              'secret': '04050405',
              'database': 'mongodb://localhost:27015/messages_it',
              'logsDirectory': 'logs',
              'serviceName': 'microservices_messageservice',
              'emailServer': 'smtp.gmail.com',
              'emailPort': '465',
              'emailUser': 'jenkinsfintechinnovation@gmail.com',
              'emailPwd': 'yT{a8q:2J~4XJ%,DeR8.STCp!*'
            };
        default:
            return {
              'secret': '04050405',
              'database': 'mongodb://microservices_messageservicemongo:27015/messages',
              'logsDirectory': 'logs',
              'serviceName': 'microservices_messageservice',
              'emailServer': 'smtp.gmail.com',
              'emailPort': '465',
              'emailUser': 'jenkinsfintechinnovation@gmail.com',
              'emailPwd': 'yT{a8q:2J~4XJ%,DeR8.STCp!*'
            };
    }
};
