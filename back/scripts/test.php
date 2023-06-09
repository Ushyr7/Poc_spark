<?php

echo "STARTING ... \n";



$host = 'db';
$dbname = getenv('MYSQL_DATABASE');
$username = 'root';
$password = getenv('MYSQL_ROOT_PASSWORD');

// Connexion à la base de données avec PDO
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
} catch (PDOException $e) {
    echo "Erreur de connexion : " . $e->getMessage();
    exit;
}

$sql = "SELECT id FROM perimeter";
$stmt = $pdo->query($sql);

$data = $stmt->fetchAll(PDO::FETCH_ASSOC);


foreach ($data as $row) {

    $perimeter_id = $row["id"];
    $sql2 = "SELECT * FROM domain WHERE perimeter_id = '" . $perimeter_id . "'";
    $result2 = $pdo->query($sql2);
    while ($row2 = $result2->fetch(PDO::FETCH_ASSOC)) {
        echo "----- Working on id :  " . $row['id'] . " domain_name : " . $row2['domain_name'] . " now  -------\n";
        $output = shell_exec("echo '" . $row2['domain_name'] . "' | nuclei -silent -j -u  -");
        if (isset($output)) {

            //formation du JSON
            $output = str_replace("\n", ',', $output);
            $output = substr_replace($output, "", -1, 1);
            $output = "[" . $output . "]";
//            $output = addslashes($output);

            //creation du JSON
//            $filename = "file" .guidv4() . ".json";
//            if (file_put_contents("/var/www/" . $filename, $output) !== false) {
//                echo $filename . " created.\n";
//            } else {
//                echo "could not create file .";
//            }

            $vulnerabilities = json_decode($output);

            foreach ($vulnerabilities as $vulnerability) {
                $template = $vulnerability->template;
                $description = $vulnerability->info->description;
                $name = $vulnerability->info->name;
                $reference =$vulnerability->info->reference;
                $severity=$vulnerability->info->severity;
                $matched_at=$vulnerability->{'matched-at'};
                $timestamp=$vulnerability->timestamp;
                $ip=$vulnerability->ip;

                $query = "SELECT COUNT(*) as count FROM vulnerability WHERE name = :name AND perimeter_id = :perimeter_id";
                $stmt = $pdo->prepare($query);
                $stmt->execute(['name' => $name, 'perimeter_id' => $row['id']]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($result['count'] == 0) {
                    // La vulnérabilité n'existe pas encore, donc on l'insère dans la base de données
                    $query = "INSERT INTO vulnerability (id, perimeter_id, template, description, name, reference,
                             severity, matched_at, timestamp, ip, status)
                          VALUES (:id, :perimeter_id, :template, :description, :name, :reference,
                             :severity, :matched_at, :timestamp, :ip, :status)";
                    $stmt = $pdo->prepare($query);
                    $stmt->execute([
                        'id' => guidv4(),
                        'perimeter_id' => $row['id'],
                        'template' => $template,
                        'description' => $description,
                        'name' => $name,
                        'reference' => $reference,
                        'severity' => $severity,
                        'matched_at' => $matched_at,
                        'timestamp' => date("Y-m-d H:i:s", strtotime($timestamp)),
                        'ip' => $ip,
                        'status' => "new",
                    ]);
                }
            }
        }
    }
}
// Fermeture de la connexion à la base de données
$pdo = null;

echo "DONE FOR NOW ... \n";

function guidv4($data = null) {
    $data = $data ?? random_bytes(16);
    assert(strlen($data) == 16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}



