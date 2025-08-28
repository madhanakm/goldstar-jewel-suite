import { useState } from 'react';
import { useApi } from '@/shared';
import { useToast } from '@/hooks/use-toast';

// Common API operations hook to reduce code duplication
export const useCommonApi = () => {
  const { loading, request } = useApi();
  const { toast } = useToast();

  const handleApiError = (error: any, customMessage?: string) => {
    toast({
      title: "❌ Error",
      description: customMessage || "An error occurred",
      variant: "destructive",
    });
  };

  const handleApiSuccess = (message: string) => {
    toast({
      title: "✅ Success",
      description: message,
    });
  };

  const loadData = async (endpoint: string, setter: (data: any[]) => void, errorMessage?: string) => {
    try {
      const response = await request(endpoint);
      setter(response.data || []);
    } catch (error) {
      handleApiError(error, errorMessage || "Failed to load data");
    }
  };

  const createData = async (endpoint: string, data: any, successMessage: string, onSuccess?: () => void) => {
    try {
      await request(endpoint, 'POST', { data });
      handleApiSuccess(successMessage);
      onSuccess?.();
    } catch (error) {
      handleApiError(error, "Failed to create record");
    }
  };

  const updateData = async (endpoint: string, data: any, successMessage: string, onSuccess?: () => void) => {
    try {
      await request(endpoint, 'PUT', { data });
      handleApiSuccess(successMessage);
      onSuccess?.();
    } catch (error) {
      handleApiError(error, "Failed to update record");
    }
  };

  return {
    loading,
    loadData,
    createData,
    updateData,
    handleApiError,
    handleApiSuccess
  };
};