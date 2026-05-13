'use client'

import { useEffect, useState } from 'react'
import {
  fetchCertificates,
  fetchProjects,
  fetchTechStacks,
} from '@/lib/portfolioService'

export default function usePortfolio() {
  const [projects, setProjects] = useState<any[]>([])
  const [certificates, setCertificates] =
    useState<any[]>([])
  const [techStacks, setTechStacks] =
    useState<any[]>([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPortfolio()
  }, [])

  const loadPortfolio = async () => {
    setLoading(true);
    const cachedProjects = sessionStorage.getItem('portfolioProjects');
    const cachedCertificates = sessionStorage.getItem('portfolioCertificates');
    const cachedTechStacks = sessionStorage.getItem('portfolioTechStacks');

    if (cachedProjects && cachedCertificates && cachedTechStacks) {
      setProjects(JSON.parse(cachedProjects));
      setCertificates(JSON.parse(cachedCertificates));
      setTechStacks(JSON.parse(cachedTechStacks));
      setLoading(false);
    } else {
      const [projectsData, certificatesData, techStacksData] = await Promise.all([
        fetchProjects(),
        fetchCertificates(),
        fetchTechStacks(),
      ]);

      setProjects(projectsData || []);
      setCertificates(certificatesData || []);
      setTechStacks(techStacksData || []);

      sessionStorage.setItem(
        'portfolioProjects',
        JSON.stringify(projectsData || [])
      );
      sessionStorage.setItem(
        'portfolioCertificates',
        JSON.stringify(certificatesData || [])
      );
      sessionStorage.setItem(
        'portfolioTechStacks',
        JSON.stringify(techStacksData || [])
      );
      setLoading(false);
    }
  };

  return {
    projects,
    certificates,
    techStacks,
    loading,
  }
}