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
            $port = $this->getPort($ipAddress);
            $ip = $this->getIp($ipAddress);

            // Check if the IP address contains a port range
            if (isset($port)) {
                $portRange = null;
                if (str_contains($port, '-')) {
                    $portRange = $port;
                }
                if ($portRange) {
                    [$start, $end] = explode("-", $portRange);
                    // Add each IP address with the corresponding port to the database
                    for ($i = $start; $i <= $end; $i++) {
                        if (!$this->isValidIp($ip) || !$this->isValidPort($i)) {
                            throw new InvalidArgumentException("Invalid ip " . $ip . ':' . $i);
                        }
                        $ipObj = new Ip();
                        $ipObj->setIpAddress($ip . ':' . $i);
                        $perimeter->addIp($ipObj);
                    }
                } else {
                    // Single port specified
                    if (!$this->isValidIp($ip) || !$this->isValidPort($port)) {
                        throw new InvalidArgumentException("Invalid ip" . $ip . ':' . $port);
                    }
                    $ipObj = new Ip();
                    $ipObj->setIpAddress($ip .':' . $port);
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
            $port = $this->getPort($ipAddress);
            $ip = $this->getIp($ipAddress);

            // Check if the IP address contains a port range
            if (isset($port)) {
                $portRange = null;
                if (str_contains($port, '-')) {
                    $portRange = $port;
                }
                if ($portRange) {
                    [$start, $end] = explode("-", $portRange);
                    // Add each IP address with the corresponding port to the database
                    for ($i = $start; $i <= $end; $i++) {
                        if (!$this->isValidIp($ip) || !$this->isValidPort($i)) {
                            throw new InvalidArgumentException("Invalid ip " . $ip . ':' . $i);
                        }
                        $ipObj = new BannedIp();
                        $ipObj->setIpAddress($ip . ':' . $i);
                        $perimeter->addBannedIp($ipObj);
                    }
                } else {
                    // Single port specified
                    if (!$this->isValidIp($ip) || !$this->isValidPort($port)) {
                        throw new InvalidArgumentException("Invalid ip" . $ip . ':' . $port);
                    }
                    $ipObj = new BannedIp();
                    $ipObj->setIpAddress($ip .':' . $port);
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
            $port = $this->getPort($ipAddress);
            $ip = $this->getIp($ipAddress);

            // Check if the IP address contains a port range
            if (isset($port)) {
                $portRange = null;
                if (str_contains($port, '-')) {
                    $portRange = $port;
                }
                if ($portRange) {
                    [$start, $end] = explode("-", $portRange);
                    // Add each IP address with the corresponding port to the database
                    for ($i = $start; $i <= $end; $i++) {
                        if (!$this->isValidIp($ip) || !$this->isValidPort($i)) {
                            throw new InvalidArgumentException("Invalid ip " . $ip . ':' . $i);
                        }
                        $ipObj = new Ip();
                        $ipObj->setIpAddress($ip . ':' . $i);
                        $perimeter->addIp($ipObj);
                    }
                } else {
                    // Single port specified
                    if (!$this->isValidIp($ip) || !$this->isValidPort($port)) {
                        throw new InvalidArgumentException("Invalid ip" . $ip . ':' . $port);
                    }
                    $ipObj = new Ip();
                    $ipObj->setIpAddress($ip .':' . $port);
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
            $port = $this->getPort($ipAddress);
            $ip = $this->getIp($ipAddress);

            // Check if the IP address contains a port range
            if (isset($port)) {
                $portRange = null;
                if (str_contains($port, '-')) {
                    $portRange = $port;
                }
                if ($portRange) {
                    [$start, $end] = explode("-", $portRange);
                    // Add each IP address with the corresponding port to the database
                    for ($i = $start; $i <= $end; $i++) {
                        if (!$this->isValidIp($ip) || !$this->isValidPort($i)) {
                            throw new InvalidArgumentException("Invalid ip " . $ip . ':' . $i);
                        }
                        $ipObj = new BannedIp();
                        $ipObj->setIpAddress($ip . ':' . $i);
                        $perimeter->addBannedIp($ipObj);
                    }
                } else {
                    // Single port specified
                    if (!$this->isValidIp($ip) || !$this->isValidPort($port)) {
                        throw new InvalidArgumentException("Invalid ip" . $ip . ':' . $port);
                    }
                    $ipObj = new BannedIp();
                    $ipObj->setIpAddress($ip .':' . $port);
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