<?php

namespace App\Service;

use App\Entity\BannedIp;
use App\Entity\Domain;
use App\Entity\Ip;
use App\Entity\Perimeter;
use App\Repository\BannedIpRepository;
use App\Repository\DomainRepository;
use App\Repository\IpRepository;
use App\Repository\PerimeterRepository;
use DateTime;
use Doctrine\Persistence\ManagerRegistry;
use InvalidArgumentException;
use Symfony\Component\Validator\Constraints as Assert;


class PerimeterService
{

    private PerimeterRepository $perimeterRepository;

    private IpRepository $ipRepository;

    private DomainRepository $domainRepository;

    private BannedIpRepository $bannedIpRepository;

    public function __construct(private readonly ManagerRegistry $doctrine, PerimeterRepository $perimeterRepository,
                                IpRepository $ipRepository, DomainRepository $domainRepository,
                                BannedIpRepository $bannedIpRepository)
    {
        $this->perimeterRepository = $perimeterRepository;
        $this->ipRepository = $ipRepository;
        $this->domainRepository = $domainRepository;
        $this->bannedIpRepository = $bannedIpRepository;
    }

    public function isValidEmail(string $email): bool
    {
        $regex = '/^[^\s@]+@[^\s@]+\.[^\s@]+$/';
        return preg_match($regex, $email) === 1;
    }

    public function isValidDomainName(string $domain): bool
    {
        return (preg_match("/^([a-z\d](-*[a-z\d])*)(\.([a-z\d](-*[a-z\d])*))*$/i", $domain)
            && preg_match("/^.{1,253}$/", $domain)
            && preg_match("/^[^\.]{1,63}(\.[^\.]{1,63})*$/", $domain));
    }

    function getPort($ipWithPort)
    {
        $port = explode(':', $ipWithPort);
        $port = $port[sizeof($port) - 1];
        if (str_contains($port, '.') || str_contains($port, ']') ) {
            return null;
        }
        return $port;
    }

    function getIp($ipWithPort)
    {
        $ipParts = explode(':', $ipWithPort);
        $ip = $ipParts[0];
        if (!str_contains($ip, '.')) {
            $ip = substr($ipParts[0], 1, strlen($ipParts[0])) . ':' . $ipParts[1] . ':' . $ipParts[2] . ':' . $ipParts[3] . ':' . $ipParts[4] . ':'
                . $ipParts[5] . ':' . $ipParts[6] . ':' . substr($ipParts[7], 0, strlen($ipParts[7]) - 1);
        }
        return $ip;
    }

    function isValidIp($ip) {
        if (filter_var($ip, FILTER_VALIDATE_IP))
        {
            return true;
        }
        return false;
    }

    function isValidPort($port)
    {
        if (str_contains($port, '-')) {
            // Port range specified
            list($minPort, $maxPort) = explode('-', $port);
            if ($minPort < 1 || $maxPort > 65535 || $minPort > $maxPort) {
                return false;
            }
        } else {
            // Single port specified
            $port = (int)$port;
            if ($port < 1 || $port > 65535) {
                return false;
            }
        }
        return true;
    }


    private function getIPRangeFromCIDR(string $ip, int $cidr): array
    {
        $ipParts = explode('.', $ip);
        $ipParts = array_map('intval', $ipParts);

        $ipAsInt = ($ipParts[0] << 24) + ($ipParts[1] << 16) + ($ipParts[2] << 8) + $ipParts[3];
        $maskAsInt = (-1 << (32 - $cidr)) & 0xFFFFFFFF;

        $startIP = $ipAsInt & $maskAsInt;
        $endIP = $startIP + (~$maskAsInt & 0xFFFFFFFF);

        $ipRange = [];
        for ($i = $startIP; $i <= $endIP; $i++) {
            $currentIP = (($i >> 24) & 255) . '.' . (($i >> 16) & 255) . '.' . (($i >> 8) & 255) . '.' . ($i & 255);
            $ipRange[] = $currentIP;
        }

        return $ipRange;
    }

    private function isValidIpCIDR(string $ip, string $cidr): bool
    {
        // Check if the IP is valid
        if (!$this->isValidIp($ip)) {
            return false;
        }

        // Check if the CIDR is valid
        if (!ctype_digit($cidr) || $cidr < 0 || $cidr > 32) {
            return false;
        }

        return true;
    }

    public function create(array $domains, string $email, array $ips, array $bannedIps): Perimeter
    {
        $entityManager = $this->doctrine->getManager();

        if (!isset($domains) || !isset($email) || !isset($ips) || !isset($bannedIps)) {
            throw new InvalidArgumentException('domain names, email, ips or bannedIps cannot be empty');
        }
        if (!$this->isValidEmail($email)) {
            throw new InvalidArgumentException("Invalid email.");
        }

        $perimeter = new Perimeter();
        $perimeter->setContactMail($email);
        $perimeter->setCreatedAt(new DateTime());

        foreach ($ips as $ipAddress) {
            if (!is_string($ipAddress)) {
                throw new InvalidArgumentException("ip must be a string.");
            }

            // Check if the IP address contains CIDR notation
            if (strpos($ipAddress, '/') !== false) {
                [$ip, $cidr] = explode('/', $ipAddress);
                if (!$this->isValidIpCIDR($ip, $cidr)) {
                    throw new InvalidArgumentException("Invalid ip with CIDR: " . $ipAddress);
                }

                $ipRange = $this->getIPRangeFromCIDR($ip, $cidr);
                foreach ($ipRange as $ipInRange) {
                    $ipObj = new Ip();
                    $ipObj->setIpAddress($ipInRange);
                    $perimeter->addIp($ipObj);
                }
            } else {
                // Single IP address specified
                if (!$this->isValidIp($ipAddress)) {
                    throw new InvalidArgumentException("Invalid ip " . $ipAddress);
                }
                $ipObj = new Ip();
                $ipObj->setIpAddress($ipAddress);
                $perimeter->addIp($ipObj);
            }
        }

        foreach ($bannedIps as $ipAddress) {
            if (!is_string($ipAddress)) {
                throw new InvalidArgumentException("ip must be a string.");
            }
            // Check if the IP address contains CIDR notation
            if (strpos($ipAddress, '/') !== false) {
                [$ip, $cidr] = explode('/', $ipAddress);
                if (!$this->isValidIpCIDR($ip, $cidr)) {
                    throw new InvalidArgumentException("Invalid ip with CIDR: " . $ipAddress);
                }

                $ipRange = $this->getIPRangeFromCIDR($ip, $cidr);
                foreach ($ipRange as $ipInRange) {
                    $ipObj = new BannedIp();
                    $ipObj->setIpAddress($ipInRange);
                    $perimeter->addBannedIp($ipObj);
                }
            } else {
                // Add single IP address to the database
                if (!$this->isValidIp($ipAddress)) {
                    throw new InvalidArgumentException("Invalid ip " . $ipAddress);
                }
                $ipObj = new BannedIp();
                $ipObj->setIpAddress($ipAddress);
                $perimeter->addBannedIp($ipObj);
            }
        }

        foreach ($domains as $domain) {
            if (!$this->isValidDomainName($domain) || !is_string($domain)) {
                throw new InvalidArgumentException("Invalid domain name " . $domain);
            }
            $d = new Domain();
            $d->setDomainName($domain);

            $perimeter->addDomain($d);
        }

        $entityManager->persist($perimeter);
        $entityManager->flush();

        return $perimeter;
    }


    public function update(Perimeter $perimeter, array $domains, string $email, array $ips, array $bannedIps): Perimeter
    {

        $entityManager = $this->doctrine->getManager();

        if (!isset($domains) || !isset($email) || !isset($ips) || !isset($bannedIps)) {
            throw new InvalidArgumentException('domain names, email, ips or bannedIps cannot be empty');
        }
        if (!$this->isValidEmail($email)) {
            throw new InvalidArgumentException("Invalid email.");
        }

        $perimeter->setContactMail($email);

        // Remove old IPs and banned IPs
        $oldIps = $perimeter->getIps();
        foreach ($oldIps as $oldIp) {
            $this->ipRepository->remove($oldIp);
        }
        $oldBannedIps = $perimeter->getBannedIps();
        foreach ($oldBannedIps as $oldBannedIp) {
            $this->bannedIpRepository->remove($oldBannedIp);
        }

        $oldDomains = $perimeter->getDomains();
        foreach ($oldDomains as $oldDomain) {
            $this->domainRepository->remove($oldDomain);
        }

        // Add new IPs and banned IPs
        foreach ($ips as $ipAddress) {
            if (!is_string($ipAddress)) {
                throw new InvalidArgumentException("ip must be a string.");
            }
            // Check if the IP address contains CIDR notation
            if (strpos($ipAddress, '/') !== false) {
                [$ip, $cidr] = explode('/', $ipAddress);
                if (!$this->isValidIpCIDR($ip, $cidr)) {
                    throw new InvalidArgumentException("Invalid ip with CIDR: " . $ipAddress);
                }

                $ipRange = $this->getIPRangeFromCIDR($ip, $cidr);
                foreach ($ipRange as $ipInRange) {
                    $ipObj = new Ip();
                    $ipObj->setIpAddress($ipInRange);
                    $perimeter->addIp($ipObj);
                }
            } else {
                // Add single IP address to the database
                if (!$this->isValidIp($ipAddress)) {
                    throw new InvalidArgumentException("Invalid ip " . $ipAddress);
                }
                $ipObj = new Ip();
                $ipObj->setIpAddress($ipAddress);
                $perimeter->addIp($ipObj);
            }
        }

        foreach ($bannedIps as $ipAddress) {
            if (!is_string($ipAddress)) {
                throw new InvalidArgumentException("ip must be a string.");
            }
            // Check if the IP address contains CIDR notation
            if (strpos($ipAddress, '/') !== false) {
                [$ip, $cidr] = explode('/', $ipAddress);
                if (!$this->isValidIpCIDR($ip, $cidr)) {
                    throw new InvalidArgumentException("Invalid ip with CIDR: " . $ipAddress);
                }

                $ipRange = $this->getIPRangeFromCIDR($ip, $cidr);
                foreach ($ipRange as $ipInRange) {
                    $ipObj = new BannedIp();
                    $ipObj->setIpAddress($ipInRange);
                    $perimeter->addBannedIp($ipObj);
                }
            } else {
                // Add single IP address to the database
                if (!$this->isValidIp($ipAddress)) {
                    throw new InvalidArgumentException("Invalid ip " . $ipAddress);
                }
                $ipObj = new BannedIp();
                $ipObj->setIpAddress($ipAddress);
                $perimeter->addBannedIp($ipObj);
            }
        }

        foreach ($domains as $domain) {
            if (!$this->isValidDomainName($domain) || !is_string($domain)) {
                throw new InvalidArgumentException("Invalid domain name " . $domain);
            }
            $d = new Domain();
            $d->setDomainName($domain);

            $perimeter->addDomain($d);
        }


        $entityManager->flush();
        return $perimeter;
    }


}