<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20230502094524 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE banned_ip (id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\', perimeter_id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\', ip_address VARCHAR(255) NOT NULL, INDEX IDX_7E6140D77570A4C (perimeter_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE domain (id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\', perimeter_id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\', domain_name VARCHAR(255) NOT NULL, INDEX IDX_A7A91E0B77570A4C (perimeter_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE extracted_result (id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\', vulnerability_id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\', value VARCHAR(255) NOT NULL, INDEX IDX_FF1E9E8672897D8B (vulnerability_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE ip (id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\', perimeter_id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\', ip_address VARCHAR(255) NOT NULL, INDEX IDX_A5E3B32D77570A4C (perimeter_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE perimeter (id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\', contact_mail VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE tag (id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\', vulnerability_id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\', name VARCHAR(255) NOT NULL, INDEX IDX_389B78372897D8B (vulnerability_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE vulnerability (id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\', perimeter_id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\', template VARCHAR(255) NOT NULL, description VARCHAR(255) DEFAULT NULL, name VARCHAR(255) NOT NULL, reference VARCHAR(255) NOT NULL, severity VARCHAR(255) NOT NULL, matched_at VARCHAR(255) NOT NULL, timestamp DATETIME NOT NULL, ip VARCHAR(255) NOT NULL, solution_found VARCHAR(255) DEFAULT NULL, status VARCHAR(255) DEFAULT NULL, INDEX IDX_6C4E404777570A4C (perimeter_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE banned_ip ADD CONSTRAINT FK_7E6140D77570A4C FOREIGN KEY (perimeter_id) REFERENCES perimeter (id)');
        $this->addSql('ALTER TABLE domain ADD CONSTRAINT FK_A7A91E0B77570A4C FOREIGN KEY (perimeter_id) REFERENCES perimeter (id)');
        $this->addSql('ALTER TABLE extracted_result ADD CONSTRAINT FK_FF1E9E8672897D8B FOREIGN KEY (vulnerability_id) REFERENCES vulnerability (id)');
        $this->addSql('ALTER TABLE ip ADD CONSTRAINT FK_A5E3B32D77570A4C FOREIGN KEY (perimeter_id) REFERENCES perimeter (id)');
        $this->addSql('ALTER TABLE tag ADD CONSTRAINT FK_389B78372897D8B FOREIGN KEY (vulnerability_id) REFERENCES vulnerability (id)');
        $this->addSql('ALTER TABLE vulnerability ADD CONSTRAINT FK_6C4E404777570A4C FOREIGN KEY (perimeter_id) REFERENCES perimeter (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE banned_ip DROP FOREIGN KEY FK_7E6140D77570A4C');
        $this->addSql('ALTER TABLE domain DROP FOREIGN KEY FK_A7A91E0B77570A4C');
        $this->addSql('ALTER TABLE extracted_result DROP FOREIGN KEY FK_FF1E9E8672897D8B');
        $this->addSql('ALTER TABLE ip DROP FOREIGN KEY FK_A5E3B32D77570A4C');
        $this->addSql('ALTER TABLE tag DROP FOREIGN KEY FK_389B78372897D8B');
        $this->addSql('ALTER TABLE vulnerability DROP FOREIGN KEY FK_6C4E404777570A4C');
        $this->addSql('DROP TABLE banned_ip');
        $this->addSql('DROP TABLE domain');
        $this->addSql('DROP TABLE extracted_result');
        $this->addSql('DROP TABLE ip');
        $this->addSql('DROP TABLE perimeter');
        $this->addSql('DROP TABLE tag');
        $this->addSql('DROP TABLE vulnerability');
    }
}
