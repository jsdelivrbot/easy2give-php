<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">
<html>
    <head>
        <title>Easy2Give</title>
    </head>
    <body>
        <span>Statistic of sending sms <?=$date?></span><br>
        <span>Total sms sent: <?=$total?></span>
        <table>
            <?php foreach($statuses as $key=>$value): ?>
                <tr>
                    <td><?php echo $key; ?></td>
                    <td><?php echo $value . " (" . ($value / $total) * 100 . "%)"?></td>
                </tr>
            <?php endforeach; ?>
        </table>
    </body>
</html>




