interface emailProps {
  name: string
  link: string
}

export const emailTemplateHtml = ({ name, link }: emailProps) => {
  return `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
        }
        .header img {
            max-width: 100px;
        }
        .content {
            padding: 20px;
            text-align: left;
            line-height: 1.6;
        }
        .content h1 {
            color: #333333;
        }
        .content p {
            color: #666666;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #999999;
        }
        .button {
            display: inline-block;
            background-color: #007bff;
            color: #ffffff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="content">
            <h1>Autenticação no Pizza Shop</h1>
            <p>Olá ${name},</p>
            <p>
                Este é um email para se autenticar no Pizza Shop, por favor clique no botar abaixo.
            </p>
            <a href="${link}" class="button">Clique aqui para se autenticar</a>
        </div>
        <div class="footer">
            <p>© 2024 Pizza Shop. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
`
}